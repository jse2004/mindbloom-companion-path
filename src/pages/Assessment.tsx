import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AssessmentForm from "@/components/AssessmentForm";
import AssessmentHistory from "@/components/AssessmentHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookText, ClipboardCheck, FileText, HeartPulse } from "lucide-react";

const Assessment = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Mental Health Assessments</h1>
            <p className="text-gray-600 mt-2 max-w-3xl mx-auto">
              Evidence-based assessments to help understand your mental health needs and track your progress
            </p>
          </div>
          
          <Tabs defaultValue="assessment" className="max-w-5xl mx-auto">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="assessment" className="flex flex-col py-3 h-auto gap-1">
                <ClipboardCheck className="h-5 w-5 mx-auto" />
                <span>Start Assessment</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex flex-col py-3 h-auto gap-1">
                <FileText className="h-5 w-5 mx-auto" />
                <span>History</span>
              </TabsTrigger>
              <TabsTrigger value="learn" className="flex flex-col py-3 h-auto gap-1">
                <BookText className="h-5 w-5 mx-auto" />
                <span>Learn More</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex flex-col py-3 h-auto gap-1">
                <HeartPulse className="h-5 w-5 mx-auto" />
                <span>Get Help</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assessment">
              <AssessmentForm />
            </TabsContent>
            
            <TabsContent value="history">
              <AssessmentHistory />
            </TabsContent>
            
            <TabsContent value="learn">
              <Card>
                <CardHeader>
                  <CardTitle>About Our Assessments</CardTitle>
                  <CardDescription>
                    Learn more about the evidence-based tools we use
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg">PHQ-9 Depression Screening</h3>
                    <p className="text-gray-600 mt-1">
                      The Patient Health Questionnaire (PHQ-9) is a widely used and validated tool for assessing the severity of depression symptoms.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg">GAD-7 Anxiety Assessment</h3>
                    <p className="text-gray-600 mt-1">
                      The Generalized Anxiety Disorder scale (GAD-7) is a clinically validated screening tool for identifying possible anxiety disorders.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg">PSS Stress Scale</h3>
                    <p className="text-gray-600 mt-1">
                      The Perceived Stress Scale (PSS) is one of the most widely used psychological instruments for measuring the perception of stress.
                    </p>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg">Sleep Quality Assessment</h3>
                    <p className="text-gray-600 mt-1">
                      Based on clinically validated sleep questionnaires to evaluate sleep quality and identify potential sleep disorders.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="help">
              <Card>
                <CardHeader>
                  <CardTitle>Crisis Resources</CardTitle>
                  <CardDescription>
                    If you're experiencing a mental health crisis, please reach out for help
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <h3 className="font-medium text-red-800">Emergency Situations</h3>
                    <p className="text-red-700 mt-1">
                      If you or someone you know is in immediate danger, please call emergency services (911) or go to your nearest emergency room.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium">Crisis Hotlines</h3>
                    <ul className="mt-2 space-y-3">
                      <li>
                        <div className="font-medium">National Suicide Prevention Lifeline</div>
                        <div className="text-gray-600">1-800-273-8255 (Available 24/7)</div>
                      </li>
                      <li>
                        <div className="font-medium">Crisis Text Line</div>
                        <div className="text-gray-600">Text HOME to 741741 (Available 24/7)</div>
                      </li>
                      <li>
                        <div className="font-medium">Veterans Crisis Line</div>
                        <div className="text-gray-600">1-800-273-8255 and Press 1</div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium">Find Professional Help</h3>
                    <p className="text-gray-600 mt-1">
                      Use these resources to find mental health professionals in your area:
                    </p>
                    <ul className="mt-2 space-y-2">
                      <li className="text-support-600 hover:underline">
                        <a href="#" target="_blank">Psychology Today Therapist Directory</a>
                      </li>
                      <li className="text-support-600 hover:underline">
                        <a href="#" target="_blank">SAMHSA Treatment Locator</a>
                      </li>
                      <li className="text-support-600 hover:underline">
                        <a href="#" target="_blank">National Alliance on Mental Illness (NAMI)</a>
                      </li>
                    </ul>
                  </div>
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

export default Assessment;
