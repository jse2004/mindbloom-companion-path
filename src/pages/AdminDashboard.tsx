
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Users, FileText, Brain, Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import AdminChatInterface from "@/components/AdminChatInterface";
import Analytics from "@/pages/Analytics";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuthContext();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssessments: 0,
    activeAiChats: 0,
    activeExpertChats: 0
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [searchUsers, setSearchUsers] = useState("");
  const [searchAssessments, setSearchAssessments] = useState("");

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

        // Fetch active AI chat sessions (from last 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: aiChatsCount, error: aiChatsError } = await supabase
          .from('chat_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('updated_at', twentyFourHoursAgo);

        if (aiChatsError) throw aiChatsError;

        // Fetch active expert chat sessions
        const { count: expertChatsCount, error: expertChatsError } = await supabase
          .from('expert_chat_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        if (expertChatsError) throw expertChatsError;
        
        setStats({
          totalUsers: usersCount || 0,
          totalAssessments: assessmentsCount || 0,
          activeAiChats: aiChatsCount || 0,
          activeExpertChats: expertChatsCount || 0
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Failed to load dashboard statistics");
      }
    };
    
    if (user && isAdmin) {
      fetchStats();
      setupRealtimeSubscriptions();
    }
  }, [user, isAdmin]);

  const setupRealtimeSubscriptions = () => {
    // Subscribe to stats changes
    const statsChannel = supabase
      .channel('admin_stats_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchStats();
          if (users.length > 0) fetchUsers();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessment_results'
        },
        () => {
          fetchStats();
          if (assessments.length > 0) fetchAssessments();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions'
        },
        () => {
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expert_chat_sessions'
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statsChannel);
    };
  };

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

      // Fetch active AI chat sessions (from last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: aiChatsCount, error: aiChatsError } = await supabase
        .from('chat_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', twentyFourHoursAgo);

      if (aiChatsError) throw aiChatsError;

      // Fetch active expert chat sessions
      const { count: expertChatsCount, error: expertChatsError } = await supabase
        .from('expert_chat_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (expertChatsError) throw expertChatsError;
      
      setStats({
        totalUsers: usersCount || 0,
        totalAssessments: assessmentsCount || 0,
        activeAiChats: aiChatsCount || 0,
        activeExpertChats: expertChatsCount || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard statistics");
    }
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
          
          // Extract category names from primary concerns objects
          let concernsText = 'N/A';
          if (Array.isArray(assessment.primary_concerns) && assessment.primary_concerns.length > 0) {
            concernsText = assessment.primary_concerns
              .map((concern: any) => {
                // Handle both object format and string format
                if (typeof concern === 'object' && concern.category) {
                  return concern.category.charAt(0).toUpperCase() + concern.category.slice(1);
                }
                return concern;
              })
              .join(', ');
          }
          
          return {
            id: assessment.id,
            user_name: profile 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User'
              : 'Unknown User',
            severity: assessment.overall_severity,
            concerns: concernsText,
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


  // Filter functions
  const filteredUsers = users.filter(user => 
    !searchUsers || 
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchUsers.toLowerCase()) ||
    user.role.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const filteredAssessments = assessments.filter(assessment => 
    !searchAssessments || 
    assessment.user_name.toLowerCase().includes(searchAssessments.toLowerCase()) ||
    assessment.severity.toLowerCase().includes(searchAssessments.toLowerCase()) ||
    assessment.concerns.toLowerCase().includes(searchAssessments.toLowerCase())
  );

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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  Active AI Chats
                </CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeAiChats}</div>
                <p className="text-xs text-muted-foreground">
                  Active in the last 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expert Chats
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeExpertChats}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active sessions
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
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={fetchUsers} 
                      disabled={loadingUsers}
                    >
                      {loadingUsers ? "Loading..." : "Fetch Users"}
                    </Button>
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchUsers}
                        onChange={(e) => setSearchUsers(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  {users.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
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
                          {filteredUsers.map((user) => (
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
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={fetchAssessments} 
                      disabled={loadingAssessments}
                    >
                      {loadingAssessments ? "Loading..." : "Fetch Assessments"}
                    </Button>
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search assessments..."
                        value={searchAssessments}
                        onChange={(e) => setSearchAssessments(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  {assessments.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
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
                          {filteredAssessments.map((assessment) => (
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
              <Analytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
