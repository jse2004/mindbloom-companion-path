
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Meditation = () => {
  const { user, loading } = useAuthContext();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300); // 5 minutes default
  const [selectedSession, setSelectedSession] = useState("breathing");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (isPlaying && currentTime < duration) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration - 1) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const resetSession = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const meditationSessions = [
    {
      id: "breathing",
      title: "Deep Breathing",
      description: "Focus on your breath to reduce anxiety and stress",
      duration: 300,
      color: "bg-blue-500"
    },
    {
      id: "mindfulness",
      title: "Mindfulness",
      description: "Present moment awareness meditation",
      duration: 600,
      color: "bg-green-500"
    },
    {
      id: "body-scan",
      title: "Body Scan",
      description: "Progressive relaxation through body awareness",
      duration: 900,
      color: "bg-purple-500"
    },
    {
      id: "loving-kindness",
      title: "Loving Kindness",
      description: "Cultivate compassion and self-love",
      duration: 480,
      color: "bg-pink-500"
    }
  ];

  const currentSession = meditationSessions.find(s => s.id === selectedSession);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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
      
      <main className="flex-grow bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Guided Meditation</h1>
            <p className="text-lg text-gray-600">Find peace and clarity through mindful practice</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Meditation Player */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${currentSession?.color}`}></div>
                  {currentSession?.title}
                </CardTitle>
                <CardDescription>{currentSession?.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Circle */}
                <div className="flex justify-center">
                  <div className="relative w-48 h-48">
                    <svg className="transform -rotate-90 w-48 h-48">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-200"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                        className="text-support-500 transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {formatTime(currentTime)}
                        </div>
                        <div className="text-sm text-gray-500">
                          / {formatTime(duration)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetSession}
                    className="h-12 w-12 rounded-full"
                  >
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={togglePlayPause}
                    className="h-16 w-16 rounded-full bg-support-500 hover:bg-support-600"
                  >
                    {isPlaying ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8 ml-1" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                  >
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Session Status */}
                <div className="text-center">
                  {currentTime >= duration && (
                    <p className="text-green-600 font-medium">Session Complete! 🧘‍♀️</p>
                  )}
                  {isPlaying && currentTime < duration && (
                    <p className="text-support-600 font-medium">Meditation in progress...</p>
                  )}
                  {!isPlaying && currentTime < duration && currentTime > 0 && (
                    <p className="text-gray-600">Session paused</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Session Selection */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Choose Your Practice</CardTitle>
                <CardDescription>Select a meditation style that resonates with you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {meditationSessions.map((session) => (
                  <Card
                    key={session.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSession === session.id ? 'ring-2 ring-support-500' : ''
                    }`}
                    onClick={() => {
                      setSelectedSession(session.id);
                      setDuration(session.duration);
                      setCurrentTime(0);
                      setIsPlaying(false);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${session.color}`}></div>
                        <div className="flex-1">
                          <h3 className="font-medium">{session.title}</h3>
                          <p className="text-sm text-gray-600">{session.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.floor(session.duration / 60)} minutes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <Card className="mt-8 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Benefits of Regular Meditation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="font-medium mb-2">Reduced Stress</h3>
                  <p className="text-sm text-gray-600">Lower cortisol levels and improved stress management</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">💚</span>
                  </div>
                  <h3 className="font-medium mb-2">Better Focus</h3>
                  <p className="text-sm text-gray-600">Enhanced concentration and mental clarity</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">😌</span>
                  </div>
                  <h3 className="font-medium mb-2">Emotional Balance</h3>
                  <p className="text-sm text-gray-600">Improved emotional regulation and wellbeing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Meditation;
