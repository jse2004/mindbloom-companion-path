import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User, Mail, Calendar, Shield, Activity, MessageCircle, FileText } from "lucide-react";

const ProfileDashboard = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [activityStats, setActivityStats] = useState({
    totalChats: 0,
    totalAssessments: 0,
    lastActivity: null as string | null
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadActivityStats();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data);
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityStats = async () => {
    try {
      // Get chat sessions count
      const { data: chatData, error: chatError } = await supabase
        .from('chat_sessions')
        .select('id, created_at')
        .eq('user_id', user?.id);

      if (chatError) {
        console.error('Error loading chat stats:', chatError);
      }

      // Get assessment results count
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessment_results')
        .select('id, created_at')
        .eq('user_id', user?.id);

      if (assessmentError) {
        console.error('Error loading assessment stats:', assessmentError);
      }

      // Find most recent activity
      const allActivities = [
        ...(chatData || []).map(item => ({ type: 'chat', date: item.created_at })),
        ...(assessmentData || []).map(item => ({ type: 'assessment', date: item.created_at }))
      ];
      
      const lastActivity = allActivities.length > 0 
        ? allActivities.reduce((latest, current) => 
            new Date(current.date) > new Date(latest.date) ? current : latest
          ).date
        : null;

      setActivityStats({
        totalChats: chatData?.length || 0,
        totalAssessments: assessmentData?.length || 0,
        lastActivity
      });
    } catch (error) {
      console.error('Error loading activity stats:', error);
    }
  };

  const updateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
        return;
      }

      setEditing(false);
      loadProfile();
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const getInitials = () => {
    const first = firstName || profile?.first_name || '';
    const last = lastName || profile?.last_name || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-support-100 text-support-700 text-lg">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">
                {firstName || profile?.first_name} {lastName || profile?.last_name}
              </h3>
              <p className="text-gray-600 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              <Badge variant="outline" className="text-xs">
                {profile?.role || 'user'}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              {editing ? (
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                />
              ) : (
                <Input
                  value={profile?.first_name || 'Not set'}
                  disabled
                  className="bg-gray-50"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              {editing ? (
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                />
              ) : (
                <Input
                  value={profile?.last_name || 'Not set'}
                  disabled
                  className="bg-gray-50"
                />
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {editing ? (
              <>
                <Button onClick={updateProfile}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Created</Label>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Unknown'}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email Verified</Label>
              <Badge variant={user?.email_confirmed_at ? "default" : "secondary"}>
                {user?.email_confirmed_at ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Summary
          </CardTitle>
          <CardDescription>
            Your platform usage and engagement statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-support-50 rounded-lg">
              <MessageCircle className="h-8 w-8 mx-auto text-support-600 mb-2" />
              <div className="text-2xl font-bold text-support-700">{activityStats.totalChats}</div>
              <div className="text-sm text-gray-600">Chat Sessions</div>
            </div>
            <div className="text-center p-4 bg-bloom-50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto text-bloom-600 mb-2" />
              <div className="text-2xl font-bold text-bloom-700">{activityStats.totalAssessments}</div>
              <div className="text-sm text-gray-600">Assessments Taken</div>
            </div>
            <div className="text-center p-4 bg-mind-50 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto text-mind-600 mb-2" />
              <div className="text-sm font-medium text-mind-700">Last Activity</div>
              <div className="text-xs text-gray-600">
                {activityStats.lastActivity 
                  ? new Date(activityStats.lastActivity).toLocaleDateString() 
                  : 'No activity yet'
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileDashboard;
