
import { MessageCircle, BarChart2, ClipboardList, Video, Shield, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeatureCard from "@/components/FeatureCard";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isAdmin } = useAuthContext();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Our Platform Features</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive tools designed to support your mental health journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={MessageCircle}
                title="AI-Powered Chat Support"
                description="24/7 conversational AI trained to provide evidence-based mental health support and guidance."
                iconColor="text-mind-500"
              />
              <FeatureCard 
                icon={BarChart2}
                title="Progress Tracking"
                description="Monitor your mental wellness journey with personalized analytics and insights."
                iconColor="text-bloom-500"
              />
              <FeatureCard 
                icon={ClipboardList}
                title="Personalized Assessments"
                description="Evidence-based evaluations to understand your unique mental health needs."
                iconColor="text-support-500"
              />
              <FeatureCard 
                icon={Video}
                title="Therapeutic Video Library"
                description="Expert-created videos covering various mental health topics and techniques."
                iconColor="text-mind-500"
              />
              <FeatureCard 
                icon={Shield}
                title="Privacy & Security"
                description="Your data is encrypted and protected with the highest security standards."
                iconColor="text-support-500"
              />
              <FeatureCard 
                icon={Users}
                title="Care Management"
                description="Easily manage multiple profiles for those in your care with personalized tracking."
                iconColor="text-bloom-500"
              />
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Trusted by Professionals</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Hear from mental health experts who recommend our platform
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Dr. Sarah Johnson</h4>
                    <p className="text-sm text-gray-600">Clinical Psychologist</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The AI capabilities of MindBloom provide excellent supplementary care between therapy sessions. I recommend it to many of my patients."
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Michael Torres</h4>
                    <p className="text-sm text-gray-600">Mental Health Advocate</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "MindBloom makes mental health support accessible to those who otherwise might not have resources. The personalized approach makes all the difference."
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                  <div className="ml-4">
                    <h4 className="font-semibold">Dr. Lisa Chen</h4>
                    <p className="text-sm text-gray-600">Psychiatrist</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The assessment tools and tracking capabilities provide invaluable data that helps me deliver more personalized care to my patients."
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-mind-500 to-support-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Start Your Mental Wellness Journey Today</h2>
            <p className="mt-6 text-xl max-w-3xl mx-auto">
              Join thousands of users already benefiting from personalized mental health support
            </p>
            {user ? (
              <Button asChild size="lg" className="mt-8 bg-white text-support-600 hover:bg-gray-100">
                <Link to={isAdmin ? "/admin" : "/user"}>
                  Go to {isAdmin ? "Admin Dashboard" : "Dashboard"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-8 bg-white text-support-600 hover:bg-gray-100">
                <Link to="/auth">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
