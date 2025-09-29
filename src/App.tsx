import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AgentRegister from "./pages/AgentRegister";
import BookService from "./pages/BookService";
import Booking from "./pages/Booking";
import Billing from "./pages/Billing";
import Invoices from "./pages/Invoices";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Education from "./pages/Education";
import Tutorials from "./pages/Tutorials";
import AvailableTutorials from "./pages/AvailableTutorials";
import TutorProfile from "./pages/TutorProfile";
import LearnerRegister from "./pages/LearnerRegister";
import LearnerLogin from "./pages/LearnerLogin";
import LearnerDashboard from "./pages/LearnerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/agent-register" element={<AgentRegister />} />
            <Route path="/book-service" element={<BookService />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/education" element={<Education />} />
            <Route path="/tutorials/available" element={<AvailableTutorials />} />
            <Route path="/tutor/:tutorId" element={<TutorProfile />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/learner/register" element={<LearnerRegister />} />
            <Route path="/learner/login" element={<LearnerLogin />} />
            <Route path="/learner" element={<LearnerDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
