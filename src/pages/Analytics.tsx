import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, TrendingUp, Users, AlertCircle, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DepartmentAnalytics {
  department: string;
  uniqueStudents: number;
  totalRequests: number;
  shortName: string;
}

interface IssueAnalytics {
  issue: string;
  count: number;
  percentage: number;
}

const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#F43F5E'];

const DEPARTMENT_LABELS: { [key: string]: { full: string; short: string } } = {
  'College of Computing Studies': { full: 'College of Computing Studies', short: 'CCS' },
  'College of Health Sciences': { full: 'College of Health Sciences', short: 'CHS' },
  'College of Criminal Justice': { full: 'College of Criminal Justice', short: 'CCJ' },
  'College of Education': { full: 'College of Education', short: 'CE' },
  'College of Business and Public Management': { full: 'College of Business and Public Management', short: 'CBPM' },
  'College of Law': { full: 'College of Law', short: 'CL' },
  'College of Arts and Sciences': { full: 'College of Arts and Sciences', short: 'CAS' }
};

const ISSUE_LABELS: { [key: string]: string } = {
  'academic-pressure': 'Academic Pressure',
  'heavy-workload': 'Heavy Workload',
  'strict-deadlines': 'Strict Deadlines',
  'fear-of-failure': 'Fear of Failure',
  'scholarship-pressure': 'Scholarship Pressure',
  'career-uncertainty': 'Career Uncertainty',
  'job-opportunities': 'Job Opportunities',
  'fear-of-underemployment': 'Fear of Underemployment',
  'research-publication-pressure': 'Research Pressure',
  'lack-mental-health-training': 'Lack of Mental Health Training',
  'other': 'Other'
};

const Analytics = () => {
  const { user, isAdmin } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<DepartmentAnalytics[]>([]);
  const [issueData, setIssueData] = useState<IssueAnalytics[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAnalytics();
    }
  }, [user, isAdmin]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
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
        const userIds = [...new Set(sessions.map(s => s.user_id))];
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, department')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const profileMap = (profiles || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Calculate department analytics - track both unique students and total requests
        const deptData: { [key: string]: { users: Set<string>; requests: number } } = {};
        
        sessions.forEach(session => {
          const profile = profileMap[session.user_id];
          if (profile && profile.department) {
            if (!deptData[profile.department]) {
              deptData[profile.department] = { users: new Set(), requests: 0 };
            }
            deptData[profile.department].users.add(session.user_id);
            deptData[profile.department].requests += 1;
          }
        });

        const deptAnalytics: DepartmentAnalytics[] = Object.entries(deptData)
          .map(([dept, data]) => ({
            department: DEPARTMENT_LABELS[dept]?.full || dept,
            shortName: DEPARTMENT_LABELS[dept]?.short || dept,
            uniqueStudents: data.users.size,
            totalRequests: data.requests
          }))
          .sort((a, b) => b.uniqueStudents - a.uniqueStudents);

        setDepartmentData(deptAnalytics);

        // Calculate issue analytics
        const issueCounts: { [key: string]: number } = {};
        sessions.forEach(session => {
          if (session.mental_issue_root) {
            issueCounts[session.mental_issue_root] = (issueCounts[session.mental_issue_root] || 0) + 1;
          }
        });

        const total = Object.values(issueCounts).reduce((sum, count) => sum + count, 0);
        const issueAnalytics: IssueAnalytics[] = Object.entries(issueCounts)
          .map(([issue, count]) => ({
            issue: ISSUE_LABELS[issue] || issue,
            count: count as number,
            percentage: (count as number / total) * 100
          }))
          .sort((a, b) => b.count - a.count);

        setIssueData(issueAnalytics);
        setTotalRequests(sessions.length);
      } else {
        setDepartmentData([]);
        setIssueData([]);
        setTotalRequests(0);
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
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading analytics data...</p>
      </div>
    );
  }

  const hasData = departmentData.length > 0 || issueData.length > 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Professional consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{departmentData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">With reported cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issue Types</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{issueData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique concerns identified</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Concern</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary truncate">
              {issueData.length > 0 ? issueData[0].issue : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {issueData.length > 0 ? `${issueData[0].count} cases (${issueData[0].percentage.toFixed(1)}%)` : 'No data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {!hasData ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Analytics will appear when students request medical professional consultations and specify their mental health concerns.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Department Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Department-Level Analytics
              </CardTitle>
              <CardDescription>
                Mental health consultation requests by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="shortName" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'count') return [value, 'Students'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => {
                        const dept = departmentData.find(d => d.shortName === label);
                        return dept?.department || label;
                      }}
                    />
                    <Bar 
                      dataKey="uniqueStudents" 
                      fill="#8B5CF6" 
                      radius={[8, 8, 0, 0]}
                      name="Students"
                    />
                    <Bar 
                      dataKey="totalRequests" 
                      fill="#10B981" 
                      radius={[8, 8, 0, 0]}
                      name="Requests"
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Department List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {departmentData.map((dept, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div>
                          <p className="font-medium text-sm">{dept.shortName}</p>
                          <p className="text-xs text-muted-foreground">{dept.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-semibold">{dept.uniqueStudents}</p>
                          <p className="text-xs text-muted-foreground">students</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">{dept.totalRequests}</p>
                          <p className="text-xs text-muted-foreground">requests</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issue Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Issue Distribution
                </CardTitle>
                <CardDescription>
                  Percentage breakdown of mental health concerns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={issueData as any}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.percentage.toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {issueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Top Mental Health Concerns
                </CardTitle>
                <CardDescription>
                  Most reported issues by students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {issueData.map((issue, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{issue.issue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{issue.count}</span>
                          <Badge variant="outline" className="text-xs">
                            {issue.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${issue.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
