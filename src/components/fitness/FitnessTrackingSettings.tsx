
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Watch, Activity, Heart, Loader2 } from "lucide-react";
import { useStepTracking } from "@/hooks/use-step-tracking";

export const FitnessTrackingSettings = () => {
  const {
    connectedSources,
    loading,
    connectDevice,
    connectAppleHealth,
    connectGoogleFit,
    connectFitbit,
    isTracking
  } = useStepTracking();

  const trackingSources = [
    {
      id: 'device',
      name: 'Device Pedometer',
      description: 'Use your phone\'s built-in step counter',
      icon: Smartphone,
      connect: connectDevice,
      available: 'permissions' in navigator
    },
    {
      id: 'apple_health',
      name: 'Apple Health',
      description: 'Sync with Apple Health app (iOS only)',
      icon: Heart,
      connect: connectAppleHealth,
      available: /iPad|iPhone|iPod/.test(navigator.userAgent)
    },
    {
      id: 'google_fit',
      name: 'Google Fit',
      description: 'Connect to Google Fit for step tracking',
      icon: Activity,
      connect: connectGoogleFit,
      available: true
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      description: 'Sync with your Fitbit device',
      icon: Watch,
      connect: connectFitbit,
      available: true
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Fitness Tracking</h3>
        <p className="text-sm text-muted-foreground">
          Connect your fitness devices and apps to automatically track your steps and activities.
        </p>
      </div>

      {isTracking && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Tracking
            </CardTitle>
            <CardDescription className="text-green-700">
              Your steps are being tracked automatically
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4">
        {trackingSources.map((source) => {
          const isConnected = connectedSources.includes(source.id);
          const IconComponent = source.icon;

          return (
            <Card key={source.id} className={!source.available ? 'opacity-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-base">{source.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {source.description}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    )}
                    
                    {!source.available && (
                      <Badge variant="secondary">
                        Not Available
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button
                  onClick={source.connect}
                  disabled={loading || !source.available || isConnected}
                  variant={isConnected ? "secondary" : "default"}
                  size="sm"
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : isConnected ? (
                    'Connected'
                  ) : (
                    `Connect ${source.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">Setup Instructions:</p>
            <ul className="space-y-1 text-xs">
              <li>• For Google Fit and Fitbit, you'll need to configure API credentials</li>
              <li>• Apple Health requires iOS 16+ and PWA installation</li>
              <li>• Device pedometer works in supported browsers with permission</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
