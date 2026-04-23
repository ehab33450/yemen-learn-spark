import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Tracks from "./pages/Tracks.tsx";
import TrackDetail from "./pages/TrackDetail.tsx";
import CourseDetail from "./pages/CourseDetail.tsx";
import LessonView from "./pages/LessonView.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Welcome from "./pages/Welcome.tsx";
import Certificates from "./pages/Certificates.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/tracks" element={<Tracks />} />
            <Route path="/tracks/:slug" element={<TrackDetail />} />
            <Route path="/courses" element={<Tracks />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/lessons/:id" element={<LessonView />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/certificates" element={<Certificates />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
