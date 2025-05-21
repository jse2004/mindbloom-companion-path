
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatInterface from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BookOpen, HeartPulse, History, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Chatbot = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState<{ id: string; preview: string; date: string }[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Load chat history
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    // In a real app, you would fetch this from a database
    // For now, we'll just simulate some history data
    setTimeout(() => {
      setChatHistory([
        { id: "1", preview: "Discussion about anxiety management", date: "Today" },
        { id: "2", preview: "Sleep improvement strategies", date: "Yesterday" },
        { id: "3", preview: "Meditation techniques", date: "May 19" }
      ]);
      setLoadingHistory(false);
    }, 500);
  };

  const handleSuggestedTopic = (topic: string) => {
    // This would normally be handled by passing a prop to ChatInterface
    // For now, we'll just show what topics are clicked
    console.log("Selected topic:", topic);
  };

  const handleToolClick = (toolName: string) => {
    // This would normally be handled by passing a prop to ChatInterface
    // For now, we'll just show what tool is clicked
    console.log("Selected tool:", toolName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => handleSuggestedTopic("I've been feeling anxious lately")}
                  >
                    "I've been feeling anxious lately"
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => handleSuggestedTopic("Help me with stress management")}
                  >
                    "Help me with stress management"
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => handleSuggestedTopic("I'm having trouble sleeping")}
                  >
                    "I'm having trouble sleeping"
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    onClick={() => handleSuggestedTopic("I need motivation techniques")}
                  >
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
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleToolClick("crisis")}
                      >
                        <HeartPulse className="mr-2 h-4 w-4 text-red-500" />
                        <span>Crisis Resources</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleToolClick("meditation")}
                      >
                        <Brain className="mr-2 h-4 w-4 text-support-500" />
                        <span>Guided Meditation</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleToolClick("reset")}
                      >
                        <RefreshCw className="mr-2 h-4 w-4 text-bloom-500" />
                        <span>Reset Conversation</span>
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="resources" className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleToolClick("articles")}
                      >
                        <BookOpen className="mr-2 h-4 w-4 text-mind-500" />
                        <span>Mental Health Articles</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleToolClick("worksheets")}
                      >
                        <BookOpen className="mr-2 h-4 w-4 text-mind-500" />
                        <span>Self-Help Worksheets</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleToolClick("community")}
                      >
                        <BookOpen className="mr-2 h-4 w-4 text-mind-500" />
                        <span>Community Support</span>
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="history">
                      {loadingHistory ? (
                        <div className="text-center py-3 text-gray-500">
                          <p>Loading conversation history...</p>
                        </div>
                      ) : chatHistory.length > 0 ? (
                        <div className="space-y-2">
                          {chatHistory.map(chat => (
                            <Button
                              key={chat.id}
                              variant="ghost"
                              className="w-full justify-start text-left"
                              onClick={() => console.log("Load chat", chat.id)}
                            >
                              <div>
                                <p className="font-medium text-sm">{chat.preview}</p>
                                <p className="text-xs text-gray-500">{chat.date}</p>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-gray-500">
                          <History className="h-10 w-10 mx-auto text-gray-300" />
                          <p className="mt-2">Your conversation history will appear here</p>
                        </div>
                      )}
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
