import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Universities from "./pages/Universities";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PackageProvider } from "@/contexts/PackageContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AgentRegister from "./pages/AgentRegister";
import BookService from "./pages/BookService";
import Booking from "./pages/Booking";
import Billing from "./pages/Billing";
import Invoices from "./pages/Invoices";
import Packages from "./pages/Packages";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import AdminEducationalDashboard from "./pages/AdminEducationalDashboard";
import AdminTutorManagement from "./pages/AdminTutorManagement";
import AdminStudentManagement from "./pages/AdminStudentManagement";
import TutorBooking from "./pages/TutorBooking";
import AdminDashboard from "./pages/AdminDashboard";
import Education from "./pages/Education";
import Tutorials from "./pages/Tutorials";
import AvailableTutorials from "./pages/AvailableTutorials";
import TutorProfile from "./pages/TutorProfile";
import TutorialDiscussion from "./pages/TutorialDiscussion";
import LearnerRegister from "./pages/LearnerRegister";
import LearnerLogin from "./pages/LearnerLogin";
import LearnerDashboard from "./pages/LearnerDashboard";
import LearnerDashboardHome from "./pages/LearnerDashboardHome";
import LearnerProfilePage from "./pages/LearnerProfilePage";
import LearnerTutorialsPage from "./pages/LearnerTutorialsPage";
import LearnerTutorsPage from "./pages/LearnerTutorsPage";
import LearnerNotesPage from "./pages/LearnerNotesPage";
import LearnerSubjectsPage from "./pages/LearnerSubjectsPage";
import ITSolutions from "./pages/ITSolutions";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import ApplicationHelp from "./pages/ApplicationHelp";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PackageProvider>
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
            <Route path="/packages" element={<Packages />} />
            <Route path="/checkout/:packageId" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/educational" element={<AdminEducationalDashboard />} />
        <Route path="/admin/tutors" element={<AdminTutorManagement />} />
        <Route path="/admin/students" element={<AdminStudentManagement />} />
        <Route path="/tutor-booking/:tutorId" element={<TutorBooking />} />
            <Route path="/education" element={<Education />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/tutorials/available" element={<AvailableTutorials />} />
            <Route path="/tutorials/discussion/:tutorialId" element={<TutorialDiscussion />} />
            <Route path="/tutor/:tutorId" element={<TutorProfile />} />
            <Route path="/tutorials" element={<Tutorials />} />
            <Route path="/learner/register" element={<LearnerRegister />} />
            <Route path="/learner/login" element={<LearnerLogin />} />
            <Route path="/learner" element={<LearnerDashboardHome />} />
            <Route path="/learner/dashboard" element={<LearnerDashboardHome />} />
            <Route path="/learner/profile" element={<LearnerProfilePage />} />
            <Route path="/learner/tutorials" element={<LearnerTutorialsPage />} />
            <Route path="/learner/tutors" element={<LearnerTutorsPage />} />
            <Route path="/learner/notes" element={<LearnerNotesPage />} />
            <Route path="/learner/subjects" element={<LearnerSubjectsPage />} />
            <Route path="/learner/packages" element={<Packages />} />
            <Route path="/it-solutions" element={<ITSolutions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/application-help" element={<ApplicationHelp />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
        </PackageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
