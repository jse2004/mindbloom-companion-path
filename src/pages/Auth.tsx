
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";
import { Brain } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, loading } = useAuthContext();
  const defaultTab = searchParams.get('tab') || 'sign-in';
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign In form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInRole, setSignInRole] = useState("user");
  
  // Sign Up form state
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("user");
  const [department, setDepartment] = useState("");

  // Redirect authenticated users - wait for loading to complete to properly check role
  useEffect(() => {
    if (user && !loading) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInEmail || !signInPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });
      
      if (error) {
        throw error;
      }
      
      // Check user's actual role in the database using user_roles table
      const { data: userRole, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (roleError) {
        console.error("Error checking role:", roleError);
      }
      
      const actualIsAdmin = !!userRole;
      
      // Verify the selected role matches the user's actual role
      if (signInRole === "admin" && !actualIsAdmin) {
        await supabase.auth.signOut();
        toast.error("You don't have admin permissions");
        return;
      }
      
      if (signInRole === "user" && actualIsAdmin) {
        toast.error("Admin users should sign in as Admin");
        return;
      }
      
      toast.success("Signed in successfully!");
      
      // The redirect will happen automatically through the useEffect above
      // after the AuthContext updates the isAdmin state
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
    
    if (!department) {
      toast.error("Please select your department");
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
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: 'user',
            department: department
          }
        }
      });
      
      if (error) {
        if (error.message.includes("User already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else if (error.message.includes("Invalid email")) {
          toast.error("Please enter a valid email address.");
        } else if (error.message.includes("Password should be at least")) {
          toast.error("Password must be at least 6 characters long.");
        } else if (error.message.includes("Signup is disabled")) {
          toast.error("Account creation is currently disabled. Please contact support.");
        } else {
          toast.error(error.message || "An error occurred during sign up");
        }
        return;
      }
      
      toast.success("Account created successfully! Please check your email for verification (if enabled).");
      
      // Reset form
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpConfirmPassword("");
      setFirstName("");
      setLastName("");
      setRole("user");
      setDepartment("");
      
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set the default tab based on the URL parameter
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const element = document.querySelector(`[data-value="${tabParam}"]`);
      if (element instanceof HTMLElement) {
        element.click();
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex items-center">
            <Brain className="h-10 w-10 text-support-500" />
            <span className="ml-2 text-3xl font-bold gradient-text">Universidad De Manila</span>
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
            <Tabs defaultValue={defaultTab}>
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
                  <div className="space-y-2">
                    <Label htmlFor="sign-in-role">Sign in as</Label>
                    <Select
                      value={signInRole}
                      onValueChange={(value) => setSignInRole(value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="sign-in-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={department}
                      onValueChange={(value) => setDepartment(value)}
                      disabled={isLoading}
                      required
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="College of Computing Studies">College of Computing Studies</SelectItem>
                        <SelectItem value="College of Health Sciences">College of Health Sciences</SelectItem>
                        <SelectItem value="College of Criminal Justice">College of Criminal Justice</SelectItem>
                        <SelectItem value="College of Education">College of Education</SelectItem>
                        <SelectItem value="College of Business and Public Management">College of Business and Public Management</SelectItem>
                        <SelectItem value="College of Law">College of Law</SelectItem>
                        <SelectItem value="College of Arts and Sciences">College of Arts and Sciences</SelectItem>
                      </SelectContent>
                    </Select>
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
