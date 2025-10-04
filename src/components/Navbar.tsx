
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, X, Brain, BarChart2, MessageCircle, Video, 
  ClipboardList, LogOut, UserCircle, Shield, Home
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuthContext();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 w-full border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Brain className="h-8 w-8 text-support-500" />
              <span className="ml-2 text-2xl font-bold gradient-text">UDM Mental Care</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user && (
              <>
                {isAdmin ? (
                  <>
                    <Link to="/admin" className="text-gray-700 hover:text-support-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      <Shield className="mr-1 h-4 w-4" /> Admin Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/user" className="text-gray-700 hover:text-support-600 px-3 py-2 rounded-md text-sm font-medium flex items-center">
                      <Home className="mr-1 h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/chatbot" className="text-gray-700 hover:text-support-600 px-3 py-2 rounded-md text-sm font-medium">
                      <span className="flex items-center">
                        <MessageCircle className="mr-1 h-4 w-4" /> AI Assistant
                      </span>
                    </Link>
                    <Link to="/assessment" className="text-gray-700 hover:text-support-600 px-3 py-2 rounded-md text-sm font-medium">
                      <span className="flex items-center">
                        <ClipboardList className="mr-1 h-4 w-4" /> Assessments
                      </span>
                    </Link>
                    <Link to="/videos" className="text-gray-700 hover:text-support-600 px-3 py-2 rounded-md text-sm font-medium">
                      <span className="flex items-center">
                        <Video className="mr-1 h-4 w-4" /> Videos
                      </span>
                    </Link>
                  </>
                )}
              </>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="ml-4">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isAdmin ? (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      Dashboard
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate("/user")}>
                      Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                className="ml-4 bg-support-500 hover:bg-support-600"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-support-600 focus:outline-none"
            >
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center text-gray-700 hover:bg-support-50 hover:text-support-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={toggleMenu}
                  >
                    <Shield className="mr-2 h-5 w-5" />
                    Admin Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/user"
                      className="flex items-center text-gray-700 hover:bg-support-50 hover:text-support-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={toggleMenu}
                    >
                      <Home className="mr-2 h-5 w-5" />
                      Dashboard
                    </Link>
                    <Link
                      to="/chatbot"
                      className="flex items-center text-gray-700 hover:bg-support-50 hover:text-support-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={toggleMenu}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      AI Assistant
                    </Link>
                    <Link
                      to="/assessment"
                      className="flex items-center text-gray-700 hover:bg-support-50 hover:text-support-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={toggleMenu}
                    >
                      <ClipboardList className="mr-2 h-5 w-5" />
                      Assessments
                    </Link>
                    <Link
                      to="/videos"
                      className="flex items-center text-gray-700 hover:bg-support-50 hover:text-support-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={toggleMenu}
                    >
                      <Video className="mr-2 h-5 w-5" />
                      Video Library
                    </Link>
                  </>
                )}
              </>
            )}
            
            <div className="pt-2">
              {user ? (
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  className="w-full bg-support-500 hover:bg-support-600"
                  onClick={() => {
                    navigate("/auth");
                    toggleMenu();
                  }}
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
