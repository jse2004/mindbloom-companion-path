import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DepartmentAnalytics {
  department: string;
  count: number;
}

interface IssueAnalytics {
  issue: string;
  count: number;
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#F97316'];

const DEPARTMENT_LABELS: { [key: string]: string } = {
  'college_computing_studies': 'College of Computing Studies',
  'college_health_sciences': 'College of Health Sciences',
  'college_criminal_justice': 'College of Criminal Justice',
  'college_education': 'College of Education',
  'college_business_public_management': 'College of Business and Public Management',
  'college_law': 'College of Law',
  'college_arts_sciences': 'College of Arts and Sciences'
};

const ISSUE_LABELS: { [key: string]: string } = {
  'academic-pressure': 'Academic pressure',
  'heavy-workload': 'Heavy workload',
  'strict-deadlines': 'Strict deadlines',
  'fear-of-failure': 'Fear of failure',
  'scholarship-pressure': 'Scholarship pressure',
  'career-uncertainty': 'Career uncertainty',
  'job-opportunities': 'Job opportunities after graduation',
  'fear-of-underemployment': 'Fear of underemployment',
  'research-publication-pressure': 'Research and publication pressure',
  'lack-mental-health-training': 'Lack of mental health training',
  'other': 'Other'
};

const Analytics = () => {
  const { user, isAdmin } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<DepartmentAnalytics[]>([]);
  const [issueData, setIssueData] = useState<IssueAnalytics[]>([]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnalytics();
    }
  }, [user, isAdmin]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch expert chat sessions with mental issue roots
      const { data: sessions, error: sessionsError } = await supabase
        .from('expert_chat_sessions')
        .select(`
          id,
          user_id,
          mental_issue_root,
          created_at
        `);

      if (sessionsError) throw sessionsError;

      if (sessions && sessions.length > 0) {
        // Get unique user IDs
        const userIds = [...new Set(sessions.map(s => s.user_id))];
        
        // Fetch user profiles with department information
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, department')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Create a map of user profiles
        const profileMap = (profiles || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Calculate department analytics
        const deptCounts: { [key: string]: number } = {};
        sessions.forEach(session => {
          const profile = profileMap[session.user_id];
          if (profile && profile.department) {
            deptCounts[profile.department] = (deptCounts[profile.department] || 0) + 1;
          }
        });

        const deptAnalytics: DepartmentAnalytics[] = Object.entries(deptCounts).map(([dept, count]) => ({
          department: DEPARTMENT_LABELS[dept] || dept,
          count: count as number
        }));

        setDepartmentData(deptAnalytics);

        // Calculate issue analytics
        const issueCounts: { [key: string]: number } = {};
        sessions.forEach(session => {
          if (session.mental_issue_root) {
            issueCounts[session.mental_issue_root] = (issueCounts[session.mental_issue_root] || 0) + 1;
          }
        });

        const issueAnalytics: IssueAnalytics[] = Object.entries(issueCounts).map(([issue, count]) => ({
          issue: ISSUE_LABELS[issue] || issue,
          count: count as number
        }));

        setIssueData(issueAnalytics);
      } else {
        setDepartmentData([]);
        setIssueData([]);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Department-Level Analytics</CardTitle>
          <CardDescription>
            Number of students experiencing mental health issues by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departmentData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="department" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8B5CF6" name="Number of Students" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No department data available yet. Data will appear when students request medical professional consultations.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issue-Specific Analytics</CardTitle>
          <CardDescription>
            Distribution of mental health concerns among students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {issueData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={issueData as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.issue}: ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {issueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={issueData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="issue" 
                    type="category" 
                    width={200}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10B981" name="Number of Cases" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No issue data available yet. Data will appear when students specify mental health concerns in their consultations.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>
            Overview of mental health concerns across the institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Departments with Cases</p>
              <p className="text-2xl font-bold text-primary">{departmentData.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Issue Types Reported</p>
              <p className="text-2xl font-bold text-primary">{issueData.length}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Consultation Requests</p>
              <p className="text-2xl font-bold text-primary">
                {issueData.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
