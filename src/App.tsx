import LearnerLogin from "./pages/LearnerLogin";
import LearnerRegister from "./pages/LearnerRegister";
import LearnerNotesPage from "./pages/LearnerNotesPage";
import LearnerProfilePage from "./pages/LearnerProfilePage";
import Packages from "./pages/Packages";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import Education from "./pages/Education";
import ITSolutions from "./pages/ITSolutions";
import Universities from "./pages/Universities";
import LearnerDashboard from "./pages/LearnerDashboard";
import LearnerDashboardHome from "./pages/LearnerDashboardHome";
import LearnerSubjectsPage from "./pages/LearnerSubjectsPage";
import LearnerTutorialsPage from "./pages/LearnerTutorialsPage";
import LearnerTutorsPage from "./pages/LearnerTutorsPage";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PackageProvider } from "@/contexts/PackageContext";

// Smart Apply pages
import SmartApply from "./pages/SmartApply";
import SmartApplyConfirmEmail from "./pages/SmartApplyConfirmEmail";
import SmartApplyDashboard from "./pages/SmartApplyDashboard";
import SmartApplyProfile from "./pages/SmartApplyProfile";
import SmartApplySettings from "./pages/SmartApplySettings";
import SmartApplyCvBuilder from "./pages/SmartApplyCvBuilder";
import SmartApplyCvEditor from "./pages/SmartApplyCvEditor";
import SmartApplyPremium from "./pages/SmartApplyPremium";
import SmartApplyBilling from "./pages/SmartApplyBilling";
import SmartApplyCheckout from "./pages/SmartApplyCheckout";
import SmartApplyNotifications from "./pages/SmartApplyNotifications";
import SmartApplyMyApplications from "./pages/SmartApplyMyApplications";
import SmartApplyJobAssist from "./pages/SmartApplyJobAssist";
import Jobs from "./pages/Jobs";
import PublicCvView from "./pages/PublicCvView";
import BookServicePage from "@/features/sendMe/pages/BookServicePage";
import BookingPage from "@/features/sendMe/pages/BookingPage";

// Recruiter pages
import RecruiterAuth from "./pages/recruiter/RecruiterAuth";
import RecruiterJobs from "./pages/recruiter/RecruiterJobs";
import RecruiterJobDetail from "./pages/recruiter/RecruiterJobDetail";
import RecruiterRecruitments from "./pages/recruiter/RecruiterRecruitments";
import RecruiterRecruitmentDetail from "./pages/recruiter/RecruiterRecruitmentDetail";
import RecruiterProfilePage from "./pages/recruiter/RecruiterProfilePage";
import RecruiterSettings from "./pages/recruiter/RecruiterSettings";
import RecruiterTalentSearch from "./pages/recruiter/RecruiterTalentSearch";
import RecruiterCandidateProfile from "./pages/recruiter/RecruiterCandidateProfile";

// Other public pages
import Recruiters from "./pages/Recruiters";

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
                <Route path="/book-service" element={<BookServicePage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/it-solutions" element={<ITSolutions />} />
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

                {/* ── Smart Apply ── */}
                <Route path="/smart-apply" element={<SmartApply />} />
                <Route path="/smart-apply/sign-in" element={<SmartApply />} />
                <Route path="/smart-apply/sign-up" element={<SmartApply />} />
                <Route path="/smart-apply/apply" element={<SmartApply />} />
                <Route path="/smart-apply/confirm-email" element={<SmartApplyConfirmEmail />} />
                <Route path="/smart-apply/dashboard" element={<SmartApplyDashboard />} />
                <Route path="/smart-apply/profile" element={<SmartApplyProfile />} />
                <Route path="/smart-apply/settings" element={<SmartApplySettings />} />
                <Route path="/smart-apply/cv-builder" element={<SmartApplyCvBuilder />} />
                <Route path="/smart-apply/cv-builder/edit/:templateId" element={<SmartApplyCvEditor />} />
                <Route path="/smart-apply/premium" element={<SmartApplyPremium />} />
                <Route path="/smart-apply/billing" element={<SmartApplyBilling />} />
                <Route path="/smart-apply/checkout" element={<SmartApplyCheckout />} />
                <Route path="/smart-apply/notifications" element={<SmartApplyNotifications />} />
                <Route path="/smart-apply/my-applications" element={<SmartApplyMyApplications />} />
                <Route path="/smart-apply/jobs" element={<Jobs />} />
                <Route path="/smart-apply/job-assist" element={<SmartApplyJobAssist />} />
                {/* Public CV shareable link */}
                <Route path="/cv/:slug" element={<PublicCvView />} />

                {/* ── Recruiter ── */}
                <Route path="/recruiter" element={<RecruiterAuth />} />
                <Route path="/recruiter/sign-in" element={<RecruiterAuth />} />
                <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
                <Route path="/recruiter/jobs/:id" element={<RecruiterJobDetail />} />
                <Route path="/recruiter/recruitments" element={<RecruiterRecruitments />} />
                <Route path="/recruiter/recruitments/:id" element={<RecruiterRecruitmentDetail />} />
                <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
                <Route path="/recruiter/settings" element={<RecruiterSettings />} />
                <Route path="/recruiter/talent" element={<RecruiterTalentSearch />} />
                <Route path="/recruiter/candidates/:id" element={<RecruiterCandidateProfile />} />

                {/* ── Other public pages ── */}
                <Route path="/recruiters" element={<Recruiters />} />

                {/* 404 */}
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
