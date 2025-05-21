
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Users, FileText, Brain, BarChart2 } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuthContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    activeChats: 0
  });

  // Redirect if user is not logged in or not an admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  // Fetch dummy stats for demonstration
  useEffect(() => {
    // In a real application, you would fetch real stats from your database
    setStats({
      totalUsers: 125,
      totalAssessments: 347,
      activeChats: 42
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  +4 new users today
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assessments Completed
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAssessments}</div>
                <p className="text-xs text-muted-foreground">
                  +28 from last week
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active AI Conversations
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeChats}</div>
                <p className="text-xs text-muted-foreground">
                  Active in the last 24h
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="rounded-md border">
                    <div className="p-4">
                      <p className="text-center text-sm text-muted-foreground">
                        Connect to the database to view real user data
                      </p>
                      <div className="mt-4 flex justify-center">
                        <Button variant="outline">Fetch Users</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assessments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Results</CardTitle>
                  <CardDescription>
                    View assessment data and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <div className="p-4">
                      <p className="text-center text-sm text-muted-foreground">
                        Connect to the database to view assessment results
                      </p>
                      <div className="mt-4 flex justify-center">
                        <Button variant="outline">Fetch Assessments</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>
                    Usage statistics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border p-4 h-[300px] flex flex-col items-center justify-center">
                    <BarChart2 className="h-16 w-16 text-gray-200 mb-4" />
                    <p className="text-center text-sm text-muted-foreground">
                      Analytics data will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                  <CardDescription>
                    Manage system configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Platform settings will be available here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
