
// Step tracking service for device APIs and fitness wearables
export interface StepData {
  steps: number;
  date: Date;
  source: 'device' | 'fitbit' | 'apple_health' | 'google_fit' | 'manual';
}

export interface FitnessApiConfig {
  fitbitClientId?: string;
  googleFitClientId?: string;
}

class StepTrackerService {
  private config: FitnessApiConfig = {};
  private isTracking = false;
  private stepCountCallback?: (data: StepData) => void;

  setConfig(config: FitnessApiConfig) {
    this.config = config;
  }

  setStepCountCallback(callback: (data: StepData) => void) {
    this.stepCountCallback = callback;
  }

  // Device pedometer API (Web API)
  async requestDevicePermission(): Promise<boolean> {
    try {
      if ('permissions' in navigator) {
        const result = await navigator.permissions.query({ name: 'accelerometer' as PermissionName });
        return result.state === 'granted';
      }
      return false;
    } catch (error) {
      console.warn('Device permissions not supported:', error);
      return false;
    }
  }

  // Start tracking steps using device sensors
  async startDeviceTracking(): Promise<boolean> {
    try {
      if (!('Accelerometer' in window)) {
        console.warn('Accelerometer API not supported');
        return false;
      }

      const permission = await this.requestDevicePermission();
      if (!permission) {
        console.warn('Accelerometer permission denied');
        return false;
      }

      // Initialize accelerometer for step counting
      const accelerometer = new (window as any).Accelerometer({ frequency: 60 });
      let stepCount = 0;
      let lastY = 0;
      let stepThreshold = 1.2;

      accelerometer.addEventListener('reading', () => {
        const currentY = accelerometer.y;
        
        // Simple step detection algorithm
        if (Math.abs(currentY - lastY) > stepThreshold) {
          stepCount++;
          this.stepCountCallback?.({
            steps: stepCount,
            date: new Date(),
            source: 'device'
          });
        }
        
        lastY = currentY;
      });

      accelerometer.start();
      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Failed to start device tracking:', error);
      return false;
    }
  }

  // Apple Health integration (for iOS web apps)
  async connectAppleHealth(): Promise<boolean> {
    try {
      // Check if running in iOS Safari or PWA
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (!isIOS) {
        console.warn('Apple Health only available on iOS devices');
        return false;
      }

      // Request HealthKit data (requires iOS 16+ and PWA)
      if ('healthkit' in window) {
        const healthKit = (window as any).healthkit;
        
        const permission = await healthKit.requestAuthorization({
          read: ['stepCount', 'distanceWalkingRunning']
        });

        if (permission) {
          // Query today's steps
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          
          const stepData = await healthKit.queryQuantitySamples({
            sampleType: 'stepCount',
            startDate: startOfDay,
            endDate: today
          });

          const totalSteps = stepData.reduce((sum: number, sample: any) => sum + sample.quantity, 0);
          
          this.stepCountCallback?.({
            steps: totalSteps,
            date: today,
            source: 'apple_health'
          });

          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Failed to connect to Apple Health:', error);
      return false;
    }
  }

  // Google Fit integration
  async connectGoogleFit(): Promise<boolean> {
    try {
      if (!this.config.googleFitClientId) {
        console.error('Google Fit client ID not configured');
        return false;
      }

      // Load Google APIs
      await this.loadGoogleApis();
      
      const gapi = (window as any).gapi;
      
      // Initialize Google API client
      await gapi.load('auth2', () => {
        gapi.auth2.init({
          client_id: this.config.googleFitClientId
        });
      });

      // Sign in to Google
      const authInstance = gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn({
        scope: 'https://www.googleapis.com/auth/fitness.activity.read'
      });

      if (user.isSignedIn()) {
        // Query step data from Google Fit
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        const response = await gapi.client.request({
          path: 'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
          method: 'POST',
          body: {
            aggregateBy: [{
              dataTypeName: 'com.google.step_count.delta'
            }],
            bucketByTime: { durationMillis: 86400000 }, // 1 day
            startTimeMillis: startOfDay.getTime(),
            endTimeMillis: today.getTime()
          }
        });

        const stepData = response.result.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
        
        this.stepCountCallback?.({
          steps: stepData,
          date: today,
          source: 'google_fit'
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to connect to Google Fit:', error);
      return false;
    }
  }

  // Fitbit integration
  async connectFitbit(): Promise<boolean> {
    try {
      if (!this.config.fitbitClientId) {
        console.error('Fitbit client ID not configured');
        return false;
      }

      // Fitbit OAuth flow
      const redirectUri = encodeURIComponent(window.location.origin + '/fitbit-callback');
      const scope = encodeURIComponent('activity');
      
      const authUrl = `https://www.fitbit.com/oauth2/authorize?` +
        `client_id=${this.config.fitbitClientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_type=code`;

      // Open Fitbit authorization
      window.location.href = authUrl;
      
      return true;
    } catch (error) {
      console.error('Failed to connect to Fitbit:', error);
      return false;
    }
  }

  // Handle Fitbit callback
  async handleFitbitCallback(code: string): Promise<boolean> {
    try {
      // Exchange code for access token (this should be done on backend for security)
      const response = await fetch('/api/fitbit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      const data = await response.json();
      
      if (data.access_token) {
        // Fetch today's steps
        const stepsResponse = await fetch('https://api.fitbit.com/1/user/-/activities/steps/date/today/1d.json', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });

        const stepsData = await stepsResponse.json();
        const steps = parseInt(stepsData['activities-steps'][0].value);
        
        this.stepCountCallback?.({
          steps,
          date: new Date(),
          source: 'fitbit'
        });

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to handle Fitbit callback:', error);
      return false;
    }
  }

  private async loadGoogleApis(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google APIs'));
      document.head.appendChild(script);
    });
  }

  // Stop tracking
  stopTracking() {
    this.isTracking = false;
  }

  // Get current tracking status
  getTrackingStatus() {
    return this.isTracking;
  }
}

export const stepTracker = new StepTrackerService();
