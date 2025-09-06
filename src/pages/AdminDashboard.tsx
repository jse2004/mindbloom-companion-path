
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

        // Fetch assessments count
        const { count: assessmentsCount, error: assessmentsError } = await supabase
          .from('assessment_results')
          .select('*', { count: 'exact', head: true });

        if (assessmentsError) throw assessmentsError;

        // Fetch active expert chat sessions
        const { count: activeChatsCount, error: chatsError } = await supabase
          .from('expert_chat_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (chatsError) throw chatsError;
        
        setStats({
          totalUsers: usersCount || 0,
          totalAssessments: assessmentsCount || 0,
          activeChats: activeChatsCount || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load dashboard statistics");
      }
    };
    
    if (user && isAdmin) {
      fetchStats();
      // setupRealtimeSubscriptions();
    }
  }, [user, isAdmin]);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to user changes
    const usersChannel = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          if (users.length > 0) fetchUsers();
        }
      )
      .subscribe();

    // Subscribe to assessment changes
    const assessmentsChannel = supabase
      .channel('assessments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessment_results'
        },
        () => {
          if (assessments.length > 0) fetchAssessments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(assessmentsChannel);
    };
  };

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

  // Function to fetch assessments from Supabase
  const fetchAssessments = async () => {
    if (!user || !isAdmin) return;
    
    setLoadingAssessments(true);
    try {
      // First fetch assessments
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('id, user_id, overall_severity, primary_concerns, category_scores, created_at')
        .order('created_at', { ascending: false });

      if (assessmentError) throw assessmentError;

      if (assessmentData && assessmentData.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(assessmentData.map(a => a.user_id))];
        
        // Fetch user profiles separately
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);

        if (profileError) throw profileError;

        // Create a map of user profiles
        const profileMap = (profileData || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        const formattedAssessments = assessmentData.map(assessment => {
          const profile = profileMap[assessment.user_id];
          return {
            id: assessment.id,
            user_name: profile 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User'
              : 'Unknown User',
            severity: assessment.overall_severity,
            concerns: Array.isArray(assessment.primary_concerns) 
              ? assessment.primary_concerns.join(', ') 
              : 'N/A',
            scores: assessment.category_scores,
            date: new Date(assessment.created_at).toLocaleDateString()
          };
        });

        setAssessments(formattedAssessments);
      } else {
        setAssessments([]);
      }
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
                            <th className="text-left p-2">Role</th>
                            <th className="text-left p-2">Joined</th>
                            <th className="text-left p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-t">
                              <td className="p-2">
                                {user.first_name && user.last_name 
                                  ? `${user.first_name} ${user.last_name}` 
                                  : 'Name not provided'}
                              </td>
                              <td className="p-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                              <td className="p-2">
                                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                  Active
                                </span>
                              </td>
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
                            <th className="text-left p-2">Severity</th>
                            <th className="text-left p-2">Primary Concerns</th>
                            <th className="text-left p-2">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessments.map((assessment) => (
                            <tr key={assessment.id} className="border-t">
                              <td className="p-2">{assessment.user_name}</td>
                              <td className="p-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  assessment.severity === 'severe' 
                                    ? 'bg-red-100 text-red-800'
                                    : assessment.severity === 'moderate'
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {assessment.severity}
                                </span>
                              </td>
                              <td className="p-2 max-w-xs truncate">{assessment.concerns}</td>
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
