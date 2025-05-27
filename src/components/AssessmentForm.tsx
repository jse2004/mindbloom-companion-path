
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Enhanced assessment questions with more focus on emotions
const questions = [
  {
    id: 1,
    question: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "depression",
  },
  {
    id: 2,
    question: "Over the last 2 weeks, how often have you been bothered by feeling nervous, anxious, or on edge?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "anxiety",
  },
  {
    id: 3,
    question: "Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "physical",
  },
  {
    id: 4,
    question: "Over the last 2 weeks, how often have you been bothered by feeling tired or having little energy?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "physical",
  },
  {
    id: 5,
    question: "Over the last 2 weeks, how often have you been bothered by poor appetite or overeating?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "physical",
  },
  // New emotion-specific questions
  {
    id: 6,
    question: "How often do you feel overwhelmed by intense anger or irritability that's difficult to control?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "anger",
  },
  {
    id: 7,
    question: "How often do you feel a sense of fear or panic that comes on suddenly and intensely?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "panic",
  },
  {
    id: 8,
    question: "How often do you feel numb or emotionally disconnected from people and activities around you?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "dissociation",
  },
  {
    id: 9,
    question: "How often do you feel excessive guilt or shame about things you've done or failed to do?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "guilt",
  },
  {
    id: 10,
    question: "How often do you experience intrusive thoughts or memories that cause significant distress?",
    options: [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ],
    category: "trauma",
  },
];

type AssessmentState = "intro" | "questions" | "results";

const AssessmentForm = () => {
  const { user } = useAuthContext();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [assessmentState, setAssessmentState] = useState<AssessmentState>("intro");
  const [isSaving, setIsSaving] = useState(false);

  const handleNextQuestion = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setAssessmentState("results");
    }
  };

  const handlePreviousQuestion = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      setAssessmentState("intro");
    }
  };

  const handleOptionSelect = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentStep].id]: value,
    }));
  };

  const isCurrentQuestionAnswered = () => {
    return answers[questions[currentStep].id] !== undefined;
  };

  const calculateProgress = () => {
    return ((currentStep + 1) / questions.length) * 100;
  };

  const calculateCategoryScores = () => {
    const categories = {
      depression: { score: 0, max: 0 },
      anxiety: { score: 0, max: 0 },
      physical: { score: 0, max: 0 },
      anger: { score: 0, max: 0 },
      panic: { score: 0, max: 0 },
      dissociation: { score: 0, max: 0 },
      guilt: { score: 0, max: 0 },
      trauma: { score: 0, max: 0 },
    };
    
    questions.forEach(question => {
      const category = question.category as keyof typeof categories;
      const answer = parseInt(answers[question.id] || "0");
      
      categories[category].score += answer;
      categories[category].max += 3; // Max value per question is 3
    });
    
    // Convert to percentages and find primary concerns
    const results = Object.entries(categories).map(([category, data]) => {
      const percentage = (data.score / data.max) * 100;
      return {
        category,
        percentage,
        level: getLevelDescription(percentage),
      };
    });
    
    // Sort by percentage (highest first)
    return results.sort((a, b) => b.percentage - a.percentage);
  };

  const getLevelDescription = (percentage: number) => {
    if (percentage < 25) return "Minimal";
    if (percentage < 50) return "Mild";
    if (percentage < 75) return "Moderate";
    return "Severe";
  };
  
  const getPrimaryEmotionalConcerns = () => {
    const scores = calculateCategoryScores();
    return scores.filter(score => score.percentage > 33).slice(0, 3);
  };

  const getOverallSeverity = () => {
    let total = 0;
    let maxPossible = questions.length * 3;
    
    Object.values(answers).forEach((value) => {
      total += parseInt(value);
    });
    
    const percentage = (total / maxPossible) * 100;
    return getLevelDescription(percentage);
  };

  const getRecommendations = () => {
    const primaryConcerns = getPrimaryEmotionalConcerns();
    const overallSeverity = getOverallSeverity();
    
    // Default recommendations
    let recommendations = [
      "Self-care strategies",
      "Stress management techniques",
      "Mood tracking",
      "Sleep hygiene practices"
    ];
    
    // Add severity-specific recommendations
    if (overallSeverity === "Moderate" || overallSeverity === "Severe") {
      recommendations.push("Consultation with mental health professional");
      recommendations.push("Structured therapy approaches");
    }
    
    // Add concern-specific recommendations
    primaryConcerns.forEach(concern => {
      switch(concern.category) {
        case "depression":
          recommendations.push("Behavioral activation exercises");
          break;
        case "anxiety":
          recommendations.push("Relaxation and grounding techniques");
          break;
        case "panic":
          recommendations.push("Breathing exercises and panic management strategies");
          break;
        case "anger":
          recommendations.push("Anger management techniques");
          break;
        case "dissociation":
          recommendations.push("Grounding exercises for dissociation");
          break;
        case "trauma":
          recommendations.push("Trauma-informed care approaches");
          break;
        case "guilt":
          recommendations.push("Self-compassion practices");
          break;
      }
    });
    
    return [...new Set(recommendations)]; // Remove duplicates
  };

  const saveResultsToDashboard = async () => {
    if (!user) {
      toast.error("You must be logged in to save results");
      return;
    }

    setIsSaving(true);
    
    try {
      const categoryScores = calculateCategoryScores();
      const primaryConcerns = getPrimaryEmotionalConcerns();
      const overallSeverity = getOverallSeverity();
      const recommendations = getRecommendations();

      // Save assessment result
      const { data: assessmentResult, error: assessmentError } = await supabase
        .from('assessment_results')
        .insert({
          user_id: user.id,
          overall_severity: overallSeverity,
          primary_concerns: primaryConcerns,
          category_scores: categoryScores,
          recommendations: recommendations
        })
        .select()
        .single();

      if (assessmentError) {
        throw assessmentError;
      }

      // Create detailed recommendations
      const recommendationInserts = recommendations.map((rec, index) => ({
        assessment_result_id: assessmentResult.id,
        title: rec,
        description: getRecommendationDescription(rec),
        category: getCategoryForRecommendation(rec),
        priority: index + 1
      }));

      const { error: recommendationsError } = await supabase
        .from('recommendations')
        .insert(recommendationInserts);

      if (recommendationsError) {
        throw recommendationsError;
      }

      toast.success("Assessment results saved successfully!");
      
    } catch (error: any) {
      console.error('Error saving assessment results:', error);
      toast.error("Failed to save results. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getRecommendationDescription = (title: string) => {
    const descriptions: Record<string, string> = {
      "Self-care strategies": "Develop daily self-care routines including proper nutrition, exercise, and relaxation.",
      "Stress management techniques": "Learn and practice stress reduction methods like deep breathing and mindfulness.",
      "Mood tracking": "Keep a daily mood journal to identify patterns and triggers.",
      "Sleep hygiene practices": "Establish healthy sleep habits for better rest and recovery.",
      "Consultation with mental health professional": "Consider speaking with a therapist or counselor for professional support.",
      "Structured therapy approaches": "Explore evidence-based therapies like CBT or DBT.",
      "Behavioral activation exercises": "Engage in pleasant activities to improve mood and motivation.",
      "Relaxation and grounding techniques": "Practice techniques to manage anxiety and stay present.",
      "Breathing exercises and panic management strategies": "Learn specific techniques to manage panic attacks.",
      "Anger management techniques": "Develop healthy ways to express and manage anger.",
      "Grounding exercises for dissociation": "Practice techniques to stay connected to the present moment.",
      "Trauma-informed care approaches": "Seek specialized support for trauma-related concerns.",
      "Self-compassion practices": "Learn to treat yourself with kindness and understanding."
    };
    return descriptions[title] || "Recommended mental health practice.";
  };

  const getCategoryForRecommendation = (title: string) => {
    if (title.includes("professional") || title.includes("therapy")) return "professional";
    if (title.includes("breathing") || title.includes("panic")) return "anxiety";
    if (title.includes("anger")) return "anger";
    if (title.includes("trauma")) return "trauma";
    if (title.includes("depression") || title.includes("behavioral")) return "depression";
    return "general";
  };

  const startAssessment = () => {
    setAssessmentState("questions");
    setCurrentStep(0);
    setAnswers({});
  };

  const resetAssessment = () => {
    setAssessmentState("intro");
    setCurrentStep(0);
    setAnswers({});
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      {assessmentState === "intro" && (
        <>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Comprehensive Mental Health Assessment</CardTitle>
            <CardDescription>
              This assessment will help identify your emotional patterns and provide personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-mind-50 p-4 rounded-lg">
              <h3 className="font-medium text-mind-800 flex items-center">
                <InfoIcon className="mr-2" /> About this assessment
              </h3>
              <ul className="mt-2 space-y-2 text-mind-700">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-mind-500" />
                  <span>10 questions addressing various emotional states and experiences</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-mind-500" />
                  <span>Takes approximately 3-5 minutes to complete</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-mind-500" />
                  <span>Evaluates multiple dimensions of emotional wellbeing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-mind-500" />
                  <span>Provides detailed analysis and personalized recommendations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-mind-500" />
                  <span>Your answers are confidential and secure</span>
                </li>
              </ul>
            </div>
            <div className="bg-support-50 p-4 rounded-lg">
              <h3 className="font-medium text-support-800 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" /> Important note
              </h3>
              <p className="mt-2 text-support-700">
                This assessment is not a diagnostic tool. If you're experiencing a crisis, please contact emergency services or a mental health professional immediately.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startAssessment} className="w-full bg-support-500 hover:bg-support-600">
              Begin Assessment
            </Button>
          </CardFooter>
        </>
      )}

      {assessmentState === "questions" && (
        <>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Question {currentStep + 1} of {questions.length}</CardTitle>
                <CardDescription>Mental Health Assessment</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={resetAssessment}>
                Cancel
              </Button>
            </div>
            <Progress value={calculateProgress()} className="mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg font-medium">{questions[currentStep].question}</div>
            <RadioGroup
              value={answers[questions[currentStep].id]}
              onValueChange={handleOptionSelect}
              className="space-y-3"
            >
              {questions[currentStep].options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50">
                  <RadioGroupItem value={option.value} id={`option-${option.value}`} />
                  <Label htmlFor={`option-${option.value}`} className="flex-grow cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={!isCurrentQuestionAnswered()}
              className="flex items-center bg-support-500 hover:bg-support-600"
            >
              {currentStep < questions.length - 1 ? (
                <>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "See Results"
              )}
            </Button>
          </CardFooter>
        </>
      )}

      {assessmentState === "results" && (
        <>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your Assessment Results</CardTitle>
            <CardDescription>
              Based on your responses, here's an analysis of your emotional wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-xl font-medium mt-2">{getOverallSeverity()} Overall Level of Emotional Distress</div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Primary Emotional Concerns</h3>
              <div className="space-y-3">
                {getPrimaryEmotionalConcerns().map((concern, index) => (
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
            
            <div className="bg-mind-50 p-4 rounded-lg">
              <h3 className="font-medium text-mind-800">Assessment Insights</h3>
              <p className="mt-2 text-mind-700">
                {getOverallSeverity() === "Minimal" && "Your responses suggest minimal levels of emotional distress. Continue practicing self-care and monitoring your emotional wellbeing."}
                {getOverallSeverity() === "Mild" && "Your responses suggest mild levels of emotional distress. Consider implementing stress management techniques and wellness practices."}
                {getOverallSeverity() === "Moderate" && "Your responses suggest moderate levels of emotional distress across several domains. We recommend exploring coping strategies and considering professional support."}
                {getOverallSeverity() === "Severe" && "Your responses suggest significant levels of emotional distress. We strongly recommend consulting with a mental health professional for support."}
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Personalized Recommendations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {getRecommendations().map((recommendation, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-white">
                    <div className="font-medium text-sm">{recommendation}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {getRecommendationDescription(recommendation)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={resetAssessment}>
              Take Another Assessment
            </Button>
            <Button 
              className="w-full sm:w-auto bg-support-500 hover:bg-support-600"
              onClick={saveResultsToDashboard}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Results to Dashboard"}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

// InfoIcon component
const InfoIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-5 w-5 ${className}`}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
};

export default AssessmentForm;
