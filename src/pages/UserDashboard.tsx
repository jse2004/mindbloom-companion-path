
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, FileText, Video, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

const UserDashboard = () => {
  const { user } = useAuthContext();
  const [welcomeMessage, setWelcomeMessage] = useState(`Welcome back, ${user?.user_metadata?.first_name || 'User'}!`);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{welcomeMessage}</h1>
            <p className="text-gray-600 mt-2">
              Access your mental health resources and tools from one place
            </p>
          </div>
          
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
                <div className="text-center py-8">
                  <p className="text-gray-500">Your recent activities will appear here.</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Start by taking an assessment or chatting with our AI assistant
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default UserDashboard;
