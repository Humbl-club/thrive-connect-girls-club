
import { AppLayout } from "@/components/layout/AppLayout";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Analytics = () => {
  return (
    <AppLayout>
      <div className="container px-4 py-6 pb-20 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">Track your fitness progress and achievements</p>
          </div>
        </div>

        <AnalyticsDashboard />
      </div>
    </AppLayout>
  );
};

export default Analytics;
