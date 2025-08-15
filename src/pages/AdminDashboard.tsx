
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
import { toast } from "sonner";
import AdminChatInterface from "@/components/AdminChatInterface";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuthContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    activeChats: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);

  // Redirect if user is not logged in or not an admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  // Fetch stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        
        // Here we would also fetch assessments and active chats
        // For now, we'll just set dummy values for those
        
        setStats({
          totalUsers: usersCount || 0,
          totalAssessments: 0, // This would be fetched from a real table
          activeChats: 0 // This would be fetched from a real table
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load dashboard statistics");
      }
    };
    
    if (user && isAdmin) {
      fetchStats();
    }
  }, [user, isAdmin]);

  // Function to fetch users
  const fetchUsers = async () => {
    if (!user || !isAdmin) return;
    
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Function to fetch assessments (placeholder for now)
  const fetchAssessments = async () => {
    if (!user || !isAdmin) return;
    
    setLoadingAssessments(true);
    try {
      // This would be replaced with actual assessment data fetching
      // For demo purposes, we're creating mock data
      setAssessments([
        { id: 1, user_name: 'John Doe', score: 75, type: 'Anxiety', date: new Date().toLocaleDateString() },
        { id: 2, user_name: 'Jane Smith', score: 62, type: 'Depression', date: new Date().toLocaleDateString() }
      ]);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoadingAssessments(false);
    }
  };

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
                  Registered users in the system
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
                  Total completed assessments
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
              <TabsTrigger value="chats">Expert Chats</TabsTrigger>
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
                  <Button 
                    variant="outline" 
                    onClick={fetchUsers} 
                    disabled={loadingUsers}
                  >
                    {loadingUsers ? "Loading..." : "Fetch Users"}
                  </Button>
                  
                  {users.length > 0 ? (
                    <div className="border rounded-md overflow-hidden mt-4">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Role</th>
                            <th className="text-left p-2">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-t">
                              <td className="p-2">{user.first_name} {user.last_name}</td>
                              <td className="p-2">Email placeholder</td>
                              <td className="p-2">{user.role}</td>
                              <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : !loadingUsers && (
                    <div className="text-center p-4 text-gray-500">
                      No users to display. Click "Fetch Users" to load data.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chats" className="space-y-4">
              <AdminChatInterface />
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
                  <Button 
                    variant="outline" 
                    onClick={fetchAssessments} 
                    disabled={loadingAssessments}
                  >
                    {loadingAssessments ? "Loading..." : "Fetch Assessments"}
                  </Button>
                  
                  {assessments.length > 0 ? (
                    <div className="border rounded-md overflow-hidden mt-4">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">User</th>
                            <th className="text-left p-2">Type</th>
                            <th className="text-left p-2">Score</th>
                            <th className="text-left p-2">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessments.map((assessment) => (
                            <tr key={assessment.id} className="border-t">
                              <td className="p-2">{assessment.user_name}</td>
                              <td className="p-2">{assessment.type}</td>
                              <td className="p-2">{assessment.score}</td>
                              <td className="p-2">{assessment.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : !loadingAssessments && (
                    <div className="text-center p-4 text-gray-500">
                      No assessments to display. Click "Fetch Assessments" to load data.
                    </div>
                  )}
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
