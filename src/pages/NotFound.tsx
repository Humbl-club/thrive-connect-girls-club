
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <AppLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white rounded-xl girls-shadow p-8 w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-2">Oops!</h1>
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto my-4">
            <span className="text-3xl">404</span>
          </div>
          <p className="text-muted-foreground mb-6">
            We couldn't find the page you were looking for
          </p>
          <Button className="w-full" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
