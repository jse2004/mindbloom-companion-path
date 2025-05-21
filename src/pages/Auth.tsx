
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import { Brain } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign In form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  
  // Sign Up form state
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInEmail || !signInPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Signed in successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpEmail || !signUpPassword || !signUpConfirmPassword || !firstName || !lastName) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (signUpPassword !== signUpConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (signUpPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success("Account created! Please check your email for verification.");
      
      // Reset form
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpConfirmPassword("");
      setFirstName("");
      setLastName("");
      
    } catch (error: any) {
      toast.error(error.message || "An error occurred during sign up");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center">
            <Brain className="h-10 w-10 text-support-500" />
            <span className="ml-2 text-3xl font-bold gradient-text">MindBloom</span>
          </div>
          <p className="mt-2 text-gray-600">Mental Health Support Platform</p>
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Welcome to MindBloom</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="sign-in">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="sign-in">Sign In</TabsTrigger>
                <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="sign-in">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sign-in-email">Email</Label>
                    <Input 
                      id="sign-in-email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sign-in-password">Password</Label>
                    <Input 
                      id="sign-in-password" 
                      type="password" 
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-support-500 hover:bg-support-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="sign-up">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input 
                        id="first-name" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input 
                        id="last-name" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sign-up-email">Email</Label>
                    <Input 
                      id="sign-up-email" 
                      type="email" 
                      placeholder="your@email.com" 
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sign-up-password">Password</Label>
                    <Input 
                      id="sign-up-password" 
                      type="password" 
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password" 
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-support-500 hover:bg-support-600"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex-col">
            <p className="text-sm text-gray-500 text-center">
              By continuing, you agree to MindBloom's Terms of Service and Privacy Policy
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Auth;
