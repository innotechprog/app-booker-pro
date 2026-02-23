import LearnerLogin from "./pages/LearnerLogin";
import LearnerRegister from "./pages/LearnerRegister";
import LearnerNotesPage from "./pages/LearnerNotesPage";
import LearnerProfilePage from "./pages/LearnerProfilePage";
import Packages from "./pages/Packages";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ComingSoon from "./pages/ComingSoon";
import BookService from "./pages/BookService";
import Booking from "./pages/Booking";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Education from "./pages/Education";
import ITSolutions from "./pages/ITSolutions";
import SmartApply from "./pages/SmartApply";
import SmartApplyProfile from "./pages/SmartApplyProfile";
import SmartApplyDashboard from "./pages/SmartApplyDashboard";
import SmartApplySettings from "./pages/SmartApplySettings";
import Recruiters from "./pages/Recruiters";
import Jobs from "./pages/Jobs";
import RecruiterTalentSearch from "./pages/recruiter/RecruiterTalentSearch";
import RecruiterCandidateProfile from "./pages/recruiter/RecruiterCandidateProfile";
import RecruiterProfilePage from "./pages/recruiter/RecruiterProfilePage";
import RecruiterRecruitments from "./pages/recruiter/RecruiterRecruitments";
import RecruiterRecruitmentDetail from "./pages/recruiter/RecruiterRecruitmentDetail";
import RecruiterSettings from "./pages/recruiter/RecruiterSettings";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import RecruiterJobDetail from "./pages/recruiter/RecruiterJobDetail";
import Layout from "./components/Layout";
import Universities from "./pages/Universities";
import LearnerDashboard from "./pages/LearnerDashboard";
import LearnerDashboardHome from "./pages/LearnerDashboardHome";
import LearnerSubjectsPage from "./pages/LearnerSubjectsPage";
import LearnerTutorialsPage from "./pages/LearnerTutorialsPage";
import LearnerTutorsPage from "./pages/LearnerTutorsPage";
import TutorProfile from "./pages/TutorProfile";
import TutorBooking from "./pages/TutorBooking";
import AvailableTutorials from "./pages/AvailableTutorials";
import Billing from "./pages/Billing";
import Checkout from "./pages/Checkout";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PackageProvider } from "@/contexts/PackageContext";

import ScrollToTop from "./components/ScrollToTop";

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
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/education" element={<Education />} />
                <Route path="/it-solutions" element={<ITSolutions />} />
                <Route path="/smart-apply" element={<SmartApply />} />
                <Route path="/smart-apply/sign-in" element={<SmartApply />} />
                <Route path="/smart-apply/sign-up" element={<SmartApply />} />
                <Route path="/smart-apply/apply" element={<SmartApply />} />
                <Route path="/smart-apply/profile" element={<SmartApplyProfile />} />
                <Route path="/smart-apply/settings" element={<SmartApplySettings />} />
                <Route path="/smart-apply/dashboard" element={<SmartApplyDashboard />} />
                <Route path="/smart-apply/jobs" element={<Jobs />} />
                <Route path="/recruiters" element={<Recruiters />} />
                <Route path="/recruiter" element={<Layout><RecruiterTalentSearch /></Layout>} />
                <Route path="/recruiter/sign-in" element={<Navigate to="/smart-apply/sign-in?mode=recruiter" replace />} />
                <Route path="/recruiter/profile" element={<Layout><RecruiterProfilePage /></Layout>} />
                <Route path="/recruiter/recruitments" element={<Layout><RecruiterRecruitments /></Layout>} />
                <Route path="/recruiter/recruitments/:id" element={<Layout><RecruiterRecruitmentDetail /></Layout>} />
                <Route path="/recruiter/jobs" element={<Layout><RecruiterJobs /></Layout>} />
                <Route path="/recruiter/jobs/:id" element={<Layout><RecruiterJobDetail /></Layout>} />
                <Route path="/recruiter/settings" element={<Layout><RecruiterSettings /></Layout>} />
                <Route path="/recruiter/candidates/:id" element={<Layout><RecruiterCandidateProfile /></Layout>} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/universities" element={<Universities />} />
                <Route path="/learner/login" element={<LearnerLogin />} />
                <Route path="/learner/register" element={<LearnerRegister />} />
                <Route path="/learner/dashboard" element={<LearnerDashboard />} />
                <Route path="/learner/dashboard/home" element={<LearnerDashboardHome />} />
                <Route path="/learner/notes" element={<LearnerNotesPage />} />
                <Route path="/learner/profile" element={<LearnerProfilePage />} />
                <Route path="/learner/subjects" element={<LearnerSubjectsPage />} />
                <Route path="/learner/tutorials" element={<LearnerTutorialsPage />} />
                <Route path="/learner/packages" element={<Packages />} />
                <Route path="/learner/tutors" element={<LearnerTutorsPage />} />
                <Route path="/tutor/:tutorId" element={<TutorProfile />} />
                <Route path="/tutor-booking/:tutorId" element={<TutorBooking />} />
                <Route path="/tutorials/available" element={<AvailableTutorials />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/checkout/:packageId" element={<Checkout />} />
                <Route path="/send-me" element={<BookService />} />
                <Route path="/book-service" element={<BookService />} />
                <Route path="/booking" element={<Booking />} />
                {/* All other routes show Coming Soon */}
                <Route path="*" element={<ComingSoon />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </PackageProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
