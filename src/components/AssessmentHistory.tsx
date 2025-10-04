
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import RecommendationCard from "./RecommendationCard";

interface AssessmentResult {
  id: string;
  overall_severity: string;
  primary_concerns: any;
  category_scores: any;
  recommendations: string[];
  created_at: string;
}

interface Recommendation {
  id: string;
  title: string;
  description?: string;
  category: string;
  priority: number;
  completed: boolean;
  created_at: string;
}

const AssessmentHistory = () => {
  const { user } = useAuthContext();
  const [assessments, setAssessments] = useState<AssessmentResult[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  useEffect(() => {
    if (selectedAssessment) {
      fetchRecommendations(selectedAssessment);
    }
  }, [selectedAssessment]);

  const fetchAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessment_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAssessments(data || []);
      if (data && data.length > 0) {
        setSelectedAssessment(data[0].id);
      }
    } catch (error: any) {
      console.error('Error fetching assessments:', error);
      toast.error("Failed to load assessment history");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (assessmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*')
        .eq('assessment_result_id', assessmentId)
        .order('priority', { ascending: true });

      if (error) {
        throw error;
      }

      setRecommendations(data || []);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast.error("Failed to load recommendations");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "minimal": return "text-green-600";
      case "mild": return "text-yellow-600";
      case "moderate": return "text-orange-600";
      case "severe": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getCompletionRate = () => {
    if (recommendations.length === 0) return 0;
    const completed = recommendations.filter(r => r.completed).length;
    return (completed / recommendations.length) * 100;
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading assessment history...</p>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-10">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="mt-4 text-gray-500">No assessments completed yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Complete an assessment to see your results and recommendations here
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedAssessmentData = assessments.find(a => a.id === selectedAssessment);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
          <CardDescription>
            View your past assessments and track your progress over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedAssessment === assessment.id 
                    ? 'border-support-500 bg-support-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAssessment(assessment.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      Assessment from {new Date(assessment.created_at).toLocaleDateString()}
                    </p>
                    <p className={`text-sm ${getSeverityColor(assessment.overall_severity)}`}>
                      Overall Severity: {assessment.overall_severity}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedAssessmentData && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Details</CardTitle>
            <CardDescription>
              Results from {new Date(selectedAssessmentData.created_at).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Overall Severity</h4>
              <p className={`text-lg ${getSeverityColor(selectedAssessmentData.overall_severity)}`}>
                {selectedAssessmentData.overall_severity}
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Primary Concerns</h4>
              <div className="space-y-2">
                {selectedAssessmentData.primary_concerns.map((concern: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">{concern.category}</span>
                      <span className="text-sm text-gray-500">{concern.level}</span>
                    </div>
                    <Progress value={concern.percentage} className="mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your Recommendations</CardTitle>
                <CardDescription>
                  Personalized recommendations based on your assessment
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-support-500" />
                  <span className="text-sm font-medium">
                    {Math.round(getCompletionRate())}% Complete
                  </span>
                </div>
                <Progress value={getCompletionRate()} className="w-24 mt-1" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  id={recommendation.id}
                  title={recommendation.title}
                  description={recommendation.description}
                  category={recommendation.category}
                  priority={recommendation.priority}
                  completed={recommendation.completed}
                  onUpdate={() => fetchRecommendations(selectedAssessment!)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssessmentHistory;
