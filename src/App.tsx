import Packages from "./pages/Packages";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PackageProvider } from "@/contexts/PackageContext";
import { ContactPage } from "@/features/contact";
import {
  ApplicationHelpPage,
  EducationPage,
  LearnerDashboardHomePage,
  LearnerDashboardPage,
  LearnerLoginPage,
  LearnerNotesPage,
  LearnerProfilePage,
  LearnerRegisterPage,
  LearnerSubjectsPage,
  LearnerTutorialsPage,
  LearnerTutorsPage,
  UniversitiesPage,
} from "@/features/education";
import { ITSolutionsPage } from "@/features/itSolutions";
import {
  PublicCvViewPage,
  SmartApplyBillingPage,
  SmartApplyCheckoutPage,
  SmartApplyConfirmEmailPage,
  SmartApplyCvBuilderPage,
  SmartApplyCvEditorPage,
  SmartApplyDashboardPage,
  SmartApplyJobAssistPage,
  SmartApplyJobsPage,
  SmartApplyMyApplicationsPage,
  SmartApplyNotificationsPage,
  SmartApplyPage,
  SmartApplyPremiumPage,
  SmartApplyProfilePage,
  SmartApplySettingsPage,
} from "@/features/smartApply";
import {
  RecruiterAuthPage,
  RecruiterCandidateProfilePage,
  RecruiterJobDetailPage,
  RecruiterJobsPage,
  RecruiterProfilePage,
  RecruiterRecruitmentDetailPage,
  RecruiterRecruitmentsPage,
  RecruiterSettingsPage,
  RecruiterTalentSearchPage,
  RecruitersPage,
} from "@/features/recruiter";

import { BookServicePage, BookingPage } from "@/features/sendMe";

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
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/education" element={<EducationPage />} />
                <Route path="/application-help" element={<ApplicationHelpPage />} />
                <Route path="/book-service" element={<BookServicePage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/it-solutions" element={<ITSolutionsPage />} />
                <Route path="/universities" element={<UniversitiesPage />} />
                <Route path="/learner/login" element={<LearnerLoginPage />} />
                <Route path="/learner/register" element={<LearnerRegisterPage />} />
                <Route path="/learner/dashboard" element={<LearnerDashboardPage />} />
                <Route path="/learner/dashboard/home" element={<LearnerDashboardHomePage />} />
                <Route path="/learner/notes" element={<LearnerNotesPage />} />
                <Route path="/learner/profile" element={<LearnerProfilePage />} />
                <Route path="/learner/subjects" element={<LearnerSubjectsPage />} />
                <Route path="/learner/tutorials" element={<LearnerTutorialsPage />} />
                <Route path="/learner/packages" element={<Packages />} />
                <Route path="/learner/tutors" element={<LearnerTutorsPage />} />

                {/* ── Smart Apply ── */}
                <Route path="/smart-apply" element={<SmartApplyPage />} />
                <Route path="/smart-apply/sign-in" element={<SmartApplyPage />} />
                <Route path="/smart-apply/sign-up" element={<SmartApplyPage />} />
                <Route path="/smart-apply/apply" element={<SmartApplyPage />} />
                <Route path="/smart-apply/confirm-email" element={<SmartApplyConfirmEmailPage />} />
                <Route path="/smart-apply/dashboard" element={<SmartApplyDashboardPage />} />
                <Route path="/smart-apply/profile" element={<SmartApplyProfilePage />} />
                <Route path="/smart-apply/settings" element={<SmartApplySettingsPage />} />
                <Route path="/smart-apply/cv-builder" element={<SmartApplyCvBuilderPage />} />
                <Route path="/smart-apply/cv-builder/edit/:templateId" element={<SmartApplyCvEditorPage />} />
                <Route path="/smart-apply/premium" element={<SmartApplyPremiumPage />} />
                <Route path="/smart-apply/billing" element={<SmartApplyBillingPage />} />
                <Route path="/smart-apply/checkout" element={<SmartApplyCheckoutPage />} />
                <Route path="/smart-apply/notifications" element={<SmartApplyNotificationsPage />} />
                <Route path="/smart-apply/my-applications" element={<SmartApplyMyApplicationsPage />} />
                <Route path="/smart-apply/jobs" element={<SmartApplyJobsPage />} />
                <Route path="/smart-apply/job-assist" element={<SmartApplyJobAssistPage />} />
                {/* Public CV shareable link */}
                <Route path="/cv/:slug" element={<PublicCvViewPage />} />

                {/* ── Recruiter ── */}
                <Route path="/recruiter" element={<RecruiterAuthPage />} />
                <Route path="/recruiter/sign-in" element={<RecruiterAuthPage />} />
                <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
                <Route path="/recruiter/jobs/:id" element={<RecruiterJobDetailPage />} />
                <Route path="/recruiter/recruitments" element={<RecruiterRecruitmentsPage />} />
                <Route path="/recruiter/recruitments/:id" element={<RecruiterRecruitmentDetailPage />} />
                <Route path="/recruiter/profile" element={<RecruiterProfilePage />} />
                <Route path="/recruiter/settings" element={<RecruiterSettingsPage />} />
                <Route path="/recruiter/talent" element={<RecruiterTalentSearchPage />} />
                <Route path="/recruiter/candidates/:id" element={<RecruiterCandidateProfilePage />} />

                {/* ── Other public pages ── */}
                <Route path="/recruiters" element={<RecruitersPage />} />

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
