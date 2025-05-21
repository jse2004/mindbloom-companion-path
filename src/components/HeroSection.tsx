
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user, isAdmin } = useAuthContext();
  
  return (
    <div className="hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Your Mental Health <span className="gradient-text">Companion</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl">
              Advanced AI-powered support for your mental wellbeing. Personalized guidance,
              assessments, and resources to help you thrive.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              {user ? (
                <>
                  <Button asChild size="lg" className="bg-mind-500 hover:bg-mind-600">
                    <Link to={isAdmin ? "/admin" : "/dashboard"}>
                      {isAdmin ? "Admin Dashboard" : "Go to Dashboard"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  {!isAdmin && (
                    <Button asChild size="lg" variant="outline" className="border-support-300">
                      <Link to="/chatbot">
                        Chat with AI Assistant
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="bg-mind-500 hover:bg-mind-600">
                    <Link to="/auth">
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-support-300">
                    <Link to="/auth?tab=sign-up">
                      Create Account
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="/placeholder.svg" 
              alt="Mind Bloom Platform" 
              className="w-full h-auto rounded-xl shadow-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
