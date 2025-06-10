
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BarChart, Calendar, Trophy } from "lucide-react";

const AdminDashboard = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, Admin! Manage your Girls Club app here.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>View and manage all users.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Users</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Event Management
              </CardTitle>
              <CardDescription>Create and manage community events.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Events</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Challenge Control
              </CardTitle>
              <CardDescription>Create and oversee fitness challenges.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Challenges</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="w-5 h-5 text-primary" />
                App Analytics
              </CardTitle>
              <CardDescription>View overall application statistics.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">View Analytics</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
