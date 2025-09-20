
import { Brain } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-support-500" />
              <span className="ml-2 text-2xl font-bold gradient-text">UDM Manila</span>
            </div>
            <p className="mt-4 text-gray-600 max-w-md">
              Your 24/7 Advanced AI-powered support for your mental wellbeing. Personalized guidance,
              assessments, and resources to help you thrive.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Platform</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/dashboard" className="text-gray-600 hover:text-support-600">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="text-gray-600 hover:text-support-600">
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-gray-600 hover:text-support-600">
                  Assessments
                </Link>
              </li>
              <li>
                <Link to="/videos" className="text-gray-600 hover:text-support-600">
                  Video Library
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#" className="text-gray-600 hover:text-support-600">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-support-600">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-support-600">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-support-600">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm text-center">
            &copy; {new Date().getFullYear()} Universidad De Manila. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
