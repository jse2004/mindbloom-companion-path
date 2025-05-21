
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Chatbot from "./pages/Chatbot";
import Assessment from "./pages/Assessment";
import VideoLibrary from "./pages/VideoLibrary";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Protected route component for regular users
const UserRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuthContext();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Protected route component for admin users
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAdmin, loading } = useAuthContext();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user, isAdmin } = useAuthContext();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      <Route path="/auth" element={
        user ? (
          <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />
        ) : (
          <Auth />
        )
      } />
      
      <Route path="/dashboard" element={
        <UserRoute>
          <Dashboard />
        </UserRoute>
      } />
      
      <Route path="/admin" element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      } />
      
      <Route path="/chatbot" element={
        <UserRoute>
          <Chatbot />
        </UserRoute>
      } />
      
      <Route path="/assessment" element={
        <UserRoute>
          <Assessment />
        </UserRoute>
      } />
      
      <Route path="/videos" element={
        <UserRoute>
          <VideoLibrary />
        </UserRoute>
      } />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
