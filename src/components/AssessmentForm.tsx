
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Sample assessment questions
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
  },
];

type AssessmentState = "intro" | "questions" | "results";

const AssessmentForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [assessmentState, setAssessmentState] = useState<AssessmentState>("intro");

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

  const calculateScore = () => {
    let total = 0;
    Object.values(answers).forEach((value) => {
      total += parseInt(value);
    });
    return total;
  };

  const getResultCategory = (score: number) => {
    const maxPossibleScore = questions.length * 3;
    const percentage = (score / maxPossibleScore) * 100;
    
    if (percentage < 25) return "Minimal";
    if (percentage < 50) return "Mild";
    if (percentage < 75) return "Moderate";
    return "Severe";
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
            <CardTitle className="text-2xl">Mental Health Assessment</CardTitle>
            <CardDescription>
              This brief assessment will help us understand your current mental well-being
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
                  <span>5 questions about your feelings and experiences</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-mind-500" />
                  <span>Takes approximately 2 minutes to complete</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-mind-500" />
                  <span>Provides personalized recommendations based on your responses</span>
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
              Based on your responses, here's a summary of your current mental health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{calculateScore()}/{questions.length * 3}</div>
              <div className="text-xl font-medium mt-2">{getResultCategory(calculateScore())} Level of Distress</div>
            </div>
            
            <div className="bg-mind-50 p-4 rounded-lg">
              <h3 className="font-medium text-mind-800">What this means</h3>
              <p className="mt-2 text-mind-700">
                {getResultCategory(calculateScore()) === "Minimal" && "Your responses suggest minimal levels of distress. Continue practicing self-care and monitoring your mental health."}
                {getResultCategory(calculateScore()) === "Mild" && "Your responses suggest mild levels of distress. Consider implementing stress management techniques and self-care practices."}
                {getResultCategory(calculateScore()) === "Moderate" && "Your responses suggest moderate levels of distress. We recommend exploring coping strategies and considering speaking with a mental health professional."}
                {getResultCategory(calculateScore()) === "Severe" && "Your responses suggest significant levels of distress. We strongly recommend consulting with a mental health professional for support."}
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Recommended Resources</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="justify-start h-auto py-3">
                  <div className="text-left">
                    <div className="font-medium">Coping Strategies</div>
                    <div className="text-sm text-gray-500">Learn effective techniques</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3">
                  <div className="text-left">
                    <div className="font-medium">Video Library</div>
                    <div className="text-sm text-gray-500">Expert-created content</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3">
                  <div className="text-left">
                    <div className="font-medium">AI Assistant</div>
                    <div className="text-sm text-gray-500">Personalized support</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-3">
                  <div className="text-left">
                    <div className="font-medium">Find a Therapist</div>
                    <div className="text-sm text-gray-500">Professional help</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="w-full sm:w-auto" onClick={resetAssessment}>
              Take Another Assessment
            </Button>
            <Button className="w-full sm:w-auto bg-support-500 hover:bg-support-600">
              Save Results to Dashboard
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
