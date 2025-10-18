
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProfileDashboard from "@/components/ProfileDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, FileText, Video, ArrowRight, User, Settings, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: 'chat' | 'assessment' | 'expert_chat';
  title: string;
  created_at: string;
}

const UserDashboard = () => {
  const { user } = useAuthContext();
  const [welcomeMessage, setWelcomeMessage] = useState(`Welcome back, ${user?.user_metadata?.first_name || 'User'}!`);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecentActivities();
    }
  }, [user]);

  const loadRecentActivities = async () => {
    if (!user) return;
    
    setLoadingActivities(true);
    try {
      const activities: Activity[] = [];

      // Fetch recent chat sessions
      const { data: chatSessions } = await supabase
        .from('chat_sessions')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (chatSessions) {
        activities.push(...chatSessions.map(chat => ({
          id: chat.id,
          type: 'chat' as const,
          title: chat.title || 'Chat Session',
          created_at: chat.created_at
        })));
      }

      // Fetch recent assessments
      const { data: assessments } = await supabase
        .from('assessment_results')
        .select('id, overall_severity, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (assessments) {
        activities.push(...assessments.map(assessment => ({
          id: assessment.id,
          type: 'assessment' as const,
          title: `Mental Health Assessment - ${assessment.overall_severity}`,
          created_at: assessment.created_at
        })));
      }

      // Fetch recent expert chat sessions
      const { data: expertChats } = await supabase
        .from('expert_chat_sessions')
        .select('id, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (expertChats) {
        activities.push(...expertChats.map(chat => ({
          id: chat.id,
          type: 'expert_chat' as const,
          title: `Expert Chat - ${chat.status}`,
          created_at: chat.created_at
        })));
      }

      // Sort all activities by date
      activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecentActivities(activities.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'chat':
        return <MessageCircle className="h-4 w-4 text-mind-500" />;
      case 'assessment':
        return <FileText className="h-4 w-4 text-bloom-500" />;
      case 'expert_chat':
        return <User className="h-4 w-4 text-support-500" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{welcomeMessage}</h1>
            <p className="text-gray-600 mt-2">
              Access your mental health resources and manage your profile
            </p>
          </div>
          
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* AI Chat Assistant */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="mr-2 h-5 w-5 text-mind-500" />
                      AI Chat Assistant
                    </CardTitle>
                    <CardDescription>Talk to our mental health AI for support and guidance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Our AI assistant is trained with evidence-based approaches to provide support 
                      and guidance for various mental health concerns.
                    </p>
                    <Button asChild className="w-full justify-between bg-mind-500 hover:bg-mind-600">
                      <Link to="/chatbot">
                        <span>Start Chatting</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Assessments */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-bloom-500" />
                      Assessments
                    </CardTitle>
                    <CardDescription>Take mental health assessments and track your progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Comprehensive assessments to help you understand your mental wellbeing 
                      and track improvements over time.
                    </p>
                    <Button asChild className="w-full justify-between bg-bloom-500 hover:bg-bloom-600">
                      <Link to="/assessment">
                        <span>Take Assessment</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Video Library */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Video className="mr-2 h-5 w-5 text-support-500" />
                      Video Library
                    </CardTitle>
                    <CardDescription>Watch therapeutic and educational videos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Access our library of expert-created videos covering various mental health 
                      topics and therapeutic techniques.
                    </p>
                    <Button asChild className="w-full justify-between bg-support-500 hover:bg-support-600">
                      <Link to="/videos">
                        <span>Browse Videos</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
                <Card>
                  <CardContent className="p-6">
                    {loadingActivities ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Loading activities...</p>
                      </div>
                    ) : recentActivities.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivities.map((activity) => (
                          <div 
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <div className="mt-1">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {activity.title}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Your recent activities will appear here.</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Start by taking an assessment or chatting with our AI assistant
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="profile">
              <ProfileDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
