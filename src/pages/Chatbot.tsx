
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BookOpen, HeartPulse, History, RefreshCw } from "lucide-react";

const Chatbot = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">AI Mental Health Assistant</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chat area */}
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>
            
            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Suggested topics */}
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Topics</CardTitle>
                  <CardDescription>
                    Conversation starters to explore
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-left">
                    "I've been feeling anxious lately"
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    "Help me with stress management"
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    "I'm having trouble sleeping"
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-left">
                    "I need motivation techniques"
                  </Button>
                </CardContent>
              </Card>
              
              {/* Chat tools */}
              <Card>
                <CardHeader>
                  <CardTitle>Tools</CardTitle>
                  <CardDescription>
                    Enhance your chat experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="support">
                    <TabsList className="grid grid-cols-3 mb-4">
                      <TabsTrigger value="support">Support</TabsTrigger>
                      <TabsTrigger value="resources">Resources</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="support" className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <HeartPulse className="mr-2 h-4 w-4 text-red-500" />
                        <span>Crisis Resources</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Brain className="mr-2 h-4 w-4 text-support-500" />
                        <span>Guided Meditation</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <RefreshCw className="mr-2 h-4 w-4 text-bloom-500" />
                        <span>Reset Conversation</span>
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="resources" className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="mr-2 h-4 w-4 text-mind-500" />
                        <span>Mental Health Articles</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="mr-2 h-4 w-4 text-mind-500" />
                        <span>Self-Help Worksheets</span>
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="mr-2 h-4 w-4 text-mind-500" />
                        <span>Community Support</span>
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="history">
                      <div className="text-center py-3 text-gray-500">
                        <History className="h-10 w-10 mx-auto text-gray-300" />
                        <p className="mt-2">Your conversation history will appear here</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              {/* Disclaimer */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-medium text-yellow-800 mb-1">Important Note</h3>
                <p className="text-sm text-yellow-700">
                  This AI assistant provides support but not medical advice. If you're experiencing a crisis, please contact emergency services or a mental health professional immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chatbot;
