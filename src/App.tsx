import Packages from "./pages/Packages";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import ComingSoon from "./pages/ComingSoon";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { PackageProvider } from "@/contexts/PackageContext";
import {
  BookServicePage,
  BookingPage,
  BookingSuccessPage,
  SendMeAdminLoginPage,
  SendMeAdminLayout,
  SendMeAdminHomePage,
  SendMeAdminQuotationPage,
  SendMeAdminInvoicePage,
} from "@/features/sendMe";
import { ContactPage } from "@/features/contact";
import {
  EducationPage,
  UniversitiesPage,
  LearnerLoginPage,
  LearnerRegisterPage,
  LearnerDashboardPage,
  LearnerDashboardHomePage,
  LearnerNotesPage,
  LearnerProfilePage,
  LearnerSubjectsPage,
  LearnerTutorialsPage,
  LearnerTutorsPage,
} from "@/features/education";
import { ITSolutionsPage } from "@/features/itSolutions";
import { recruiterApi } from "@/services/recruiterApi";

// Job Assistant pages
import JobAssistant from "./features/smartApply/pages/SmartApplyPage";
import JobAssistantConfirmEmail from "./features/smartApply/pages/SmartApplyConfirmEmailPage";
import JobAssistantDashboard from "./features/smartApply/pages/SmartApplyDashboardPage";
import JobAssistantProfile from "./features/smartApply/pages/SmartApplyProfilePage";
import JobAssistantSettings from "./features/smartApply/pages/SmartApplySettingsPage";
import JobAssistantCvBuilder from "./features/smartApply/pages/SmartApplyCvBuilderPage";
import JobAssistantCvEditor from "./features/smartApply/pages/SmartApplyCvEditorPage";
import JobAssistantPremium from "./features/smartApply/pages/SmartApplyPremiumPage";
import JobAssistantBilling from "./features/smartApply/pages/SmartApplyBillingPage";
import JobAssistantCheckout from "./features/smartApply/pages/SmartApplyCheckoutPage";
import JobAssistantNotifications from "./features/smartApply/pages/SmartApplyNotificationsPage";
import JobAssistantMyApplications from "./features/smartApply/pages/SmartApplyMyApplicationsPage";
import JobAssistantJobAssist from "./features/smartApply/pages/SmartApplyJobAssistPage";
import JobAssistantInterviewPrep from "./features/smartApply/pages/SmartApplyInterviewPrepPage";
import Jobs from "./features/smartApply/pages/SmartApplyJobsPage";
import PublicCvView from "./features/smartApply/pages/PublicCvViewPage";

// Recruiter pages
import {
  RecruiterAuthPage,
  RecruiterJobsPage,
  RecruiterJobCreatePage,
  RecruiterJobDetailPage,
  RecruiterRecruitmentsPage,
  RecruiterRecruitmentDetailPage,
  RecruiterProfilePage,
  RecruiterSettingsPage,
  RecruiterTalentSearchPage,
  RecruiterCandidateProfilePage,
  RecruitersPage,
} from "@/features/recruiter";

import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();
/** Must match Vite `base` (see VITE_BASE_PATH). Vite sets import.meta.env.BASE_URL with a trailing slash. */
const ROUTER_BASENAME =
  import.meta.env.BASE_URL === "/" ? "/" : import.meta.env.BASE_URL.replace(/\/$/, "");

const RecruiterEntryPage = () =>
  recruiterApi.hasToken() ? <RecruiterTalentSearchPage /> : <RecruitersPage />;

const SMART_APPLY_TOKEN_KEY = "smart_apply_token";

const JobAssistantProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const hasSmartApplyToken = !!localStorage.getItem(SMART_APPLY_TOKEN_KEY);
  return hasSmartApplyToken ? children : <Navigate to="/smart-apply/sign-in" replace />;
};

/** Logged-out users must not see app landing/CV onboarding at `/smart-apply` — only sign-in / sign-up. */
const JobAssistantRootRoute = () => {
  const hasSmartApplyToken = !!localStorage.getItem(SMART_APPLY_TOKEN_KEY);
  if (!hasSmartApplyToken) return <Navigate to="/smart-apply/sign-in" replace />;
  return <JobAssistant />;
};

const JobAssistantAliasRedirect = () => {
  const location = useLocation();
  const smartApplyPath = location.pathname.replace(/^\/job-assistant/, "/smart-apply");
  return <Navigate to={`${smartApplyPath}${location.search}${location.hash}`} replace />;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PackageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter basename={ROUTER_BASENAME}>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/education" element={<EducationPage />} />
                <Route path="/coming-soon" element={<ComingSoon />} />
                <Route path="/book-service" element={<BookServicePage />} />
                <Route path="/booking/success" element={<BookingSuccessPage />} />
                <Route path="/booking" element={<BookingPage />} />

                <Route path="/sendme/admin/login" element={<SendMeAdminLoginPage />} />
                <Route path="/sendme/admin" element={<SendMeAdminLayout />}>
                  <Route index element={<SendMeAdminHomePage />} />
                  <Route path="quotation" element={<SendMeAdminQuotationPage />} />
                  <Route path="invoice" element={<SendMeAdminInvoicePage />} />
                </Route>
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

                {/* ── Job Assistant ── */}
                <Route path="/job-assistant/*" element={<JobAssistantAliasRedirect />} />
                <Route path="/smart-apply" element={<JobAssistantRootRoute />} />
                <Route path="/smart-apply/sign-in" element={<JobAssistant />} />
                <Route path="/smart-apply/sign-up" element={<JobAssistant />} />
                <Route path="/smart-apply/apply" element={<JobAssistantProtectedRoute><JobAssistant /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/confirm-email" element={<JobAssistantConfirmEmail />} />
                <Route path="/smart-apply/dashboard" element={<JobAssistantProtectedRoute><JobAssistantDashboard /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/profile" element={<JobAssistantProtectedRoute><JobAssistantProfile /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/settings" element={<JobAssistantProtectedRoute><JobAssistantSettings /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/cv-builder" element={<JobAssistantProtectedRoute><JobAssistantCvBuilder /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/cv-builder/edit/:templateId" element={<JobAssistantProtectedRoute><JobAssistantCvEditor /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/premium" element={<JobAssistantProtectedRoute><JobAssistantPremium /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/billing" element={<JobAssistantProtectedRoute><JobAssistantBilling /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/checkout" element={<JobAssistantProtectedRoute><JobAssistantCheckout /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/notifications" element={<JobAssistantProtectedRoute><JobAssistantNotifications /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/my-applications" element={<JobAssistantProtectedRoute><JobAssistantMyApplications /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/jobs" element={<JobAssistantProtectedRoute><Jobs /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/jobs/:jobId" element={<JobAssistantProtectedRoute><Jobs /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/job/:jobId" element={<JobAssistantProtectedRoute><Jobs /></JobAssistantProtectedRoute>} />
                <Route path="/jobs" element={<Navigate to="/smart-apply/jobs" replace />} />
                <Route path="/jobs/:jobId" element={<JobAssistantProtectedRoute><Jobs /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/job-assist" element={<JobAssistantProtectedRoute><JobAssistantJobAssist /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/interview-prep" element={<JobAssistantProtectedRoute><JobAssistantInterviewPrep /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/*" element={<JobAssistantProtectedRoute><Navigate to="/smart-apply/jobs" replace /></JobAssistantProtectedRoute>} />
                {/* Public CV shareable link */}
                <Route path="/cv/:slug" element={<PublicCvView />} />

                {/* ── Recruiter ── */}
                <Route path="/recruiter" element={<RecruiterEntryPage />} />
                <Route path="/recruiter/sign-in" element={<RecruiterAuthPage />} />
                <Route path="/recruiter/jobs" element={<RecruiterJobsPage />} />
                <Route path="/recruiter/jobs/new" element={<RecruiterJobCreatePage />} />
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
