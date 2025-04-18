
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProgressTracker from "@/components/ProgressTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, BookOpen, FileText, MessageCircle, Video } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [selectedPerson, setSelectedPerson] = useState("self");

  // Sample data - in a real app, this would come from an API
  const people = [
    { id: "self", name: "Yourself" },
    { id: "john", name: "John (Son)" },
    { id: "lisa", name: "Lisa (Daughter)" },
    { id: "mom", name: "Mom" },
  ];

  const recommendedResources = [
    {
      title: "Coping with Anxiety",
      type: "video",
      duration: "12 min",
      icon: Video,
      link: "/videos",
    },
    {
      title: "Mindfulness Techniques",
      type: "article",
      duration: "5 min read",
      icon: BookOpen,
      link: "#",
    },
    {
      title: "Sleep Improvement Strategies",
      type: "assessment",
      duration: "10 min",
      icon: FileText,
      link: "/assessment",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Person selection */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Tracking For</h2>
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {people.map((person) => (
                <button
                  key={person.id}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${
                    selectedPerson === person.id
                      ? "bg-support-500 text-white"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedPerson(person.id)}
                >
                  {person.name}
                </button>
              ))}
              <button className="px-4 py-2 rounded-full whitespace-nowrap bg-white border border-gray-200 hover:bg-gray-50 flex items-center">
                <span className="mr-1">Add Person</span>
                <span className="text-lg">+</span>
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Progress trackers */}
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-2xl font-bold">Well-being Progress</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProgressTracker 
                  title="Mood & Emotions" 
                  description="Track your emotional well-being"
                  currentScore={75}
                  averageScore={68}
                />
                <ProgressTracker 
                  title="Stress Levels" 
                  description="Monitor your stress and anxiety"
                  currentScore={42}
                  averageScore={58}
                />
                <ProgressTracker 
                  title="Sleep Quality" 
                  description="Track your sleep patterns"
                  currentScore={63}
                  averageScore={61}
                />
                <ProgressTracker 
                  title="Social Connections" 
                  description="Monitor your social engagement"
                  currentScore={85}
                  averageScore={72}
                />
              </div>
            </div>
            
            {/* Right column: Actions and resources */}
            <div className="space-y-8">
              {/* Quick actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Tools to support your mental wellness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full justify-between bg-mind-500 hover:bg-mind-600">
                    <Link to="/chatbot">
                      <div className="flex items-center">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Talk to AI Assistant</span>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-between bg-bloom-500 hover:bg-bloom-600">
                    <Link to="/assessment">
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Take Assessment</span>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-between bg-support-500 hover:bg-support-600">
                    <Link to="/videos">
                      <div className="flex items-center">
                        <Video className="mr-2 h-4 w-4" />
                        <span>Watch Therapy Videos</span>
                      </div>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              {/* Recommended resources */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended For You</CardTitle>
                  <CardDescription>
                    Personalized resources based on your profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recommendedResources.map((resource, index) => {
                    const Icon = resource.icon;
                    return (
                      <Link key={index} to={resource.link}>
                        <div className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                          <div className="p-2 rounded-full bg-gray-100">
                            <Icon className="h-5 w-5 text-support-500" />
                          </div>
                          <div className="ml-3 flex-grow">
                            <div className="font-medium">{resource.title}</div>
                            <div className="text-sm text-gray-500">
                              {resource.type} • {resource.duration}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </Link>
                    );
                  })}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">View All Resources</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
