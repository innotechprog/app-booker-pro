import { useEffect, useState } from "react";
import Packages from "./pages/Packages";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import ComingSoon from "./pages/ComingSoon";
import AboutPage from "./pages/AboutPage";
import LegalPage from "./pages/LegalPage";
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
  ApplicationHelpPage,
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
import {
  clearSmartApplySession,
  smartApplyAPI,
  SMART_APPLY_SESSION_EXPIRED_EVENT,
} from "@/services/api";

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
const SMART_APPLY_SIGN_IN = "/smart-apply/sign-in";

type SmartApplySessionStatus = "checking" | "authenticated" | "unauthenticated";

/** Validates Job Assistant session; clears local auth and redirects when missing/invalid. */
function useSmartApplySessionGuard(): SmartApplySessionStatus {
  const [status, setStatus] = useState<SmartApplySessionStatus>(() =>
    localStorage.getItem(SMART_APPLY_TOKEN_KEY) ? "checking" : "unauthenticated"
  );

  useEffect(() => {
    let cancelled = false;

    const markUnauthenticated = () => {
      if (!cancelled) setStatus("unauthenticated");
    };

    window.addEventListener(SMART_APPLY_SESSION_EXPIRED_EVENT, markUnauthenticated);

    const token = localStorage.getItem(SMART_APPLY_TOKEN_KEY);
    if (!token) {
      markUnauthenticated();
      return () => {
        cancelled = true;
        window.removeEventListener(SMART_APPLY_SESSION_EXPIRED_EVENT, markUnauthenticated);
      };
    }

    smartApplyAPI
      .getProfile()
      .then(() => {
        if (!cancelled) setStatus("authenticated");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        // 401 already cleared the session via clearSmartApplySession().
        if (!localStorage.getItem(SMART_APPLY_TOKEN_KEY)) {
          setStatus("unauthenticated");
          return;
        }
        const message = err instanceof Error ? err.message : "";
        const isAuthFailure =
          message === "Session expired" ||
          /not authorized|unauthorized|invalid token|401/i.test(message);
        if (isAuthFailure) {
          clearSmartApplySession();
          setStatus("unauthenticated");
          return;
        }
        // Network / server blips: keep the local session so we don't kick users offline.
        setStatus("authenticated");
      });

    return () => {
      cancelled = true;
      window.removeEventListener(SMART_APPLY_SESSION_EXPIRED_EVENT, markUnauthenticated);
    };
  }, []);

  return status;
}

const JobAssistantProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const status = useSmartApplySessionGuard();
  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (status === "unauthenticated") {
    return <Navigate to={SMART_APPLY_SIGN_IN} replace />;
  }
  return children;
};

/** Logged-out users must not see app landing/CV onboarding at `/smart-apply` — only sign-in / sign-up. */
const JobAssistantRootRoute = () => {
  const status = useSmartApplySessionGuard();
  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }
  if (status === "unauthenticated") return <Navigate to={SMART_APPLY_SIGN_IN} replace />;
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
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/privacy" element={<LegalPage kind="privacy" />} />
                <Route path="/terms" element={<LegalPage kind="terms" />} />
                <Route path="/cookies" element={<LegalPage kind="cookies" />} />
                <Route path="/education" element={<EducationPage />} />
                <Route path="/application-help" element={<ApplicationHelpPage />} />
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
                <Route path="/smart-apply/jobs" element={<JobAssistantProtectedRoute><ComingSoon /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/jobs/:jobId" element={<JobAssistantProtectedRoute><ComingSoon /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/job/:jobId" element={<JobAssistantProtectedRoute><ComingSoon /></JobAssistantProtectedRoute>} />
                <Route path="/jobs" element={<ComingSoon />} />
                <Route path="/jobs/:jobId" element={<ComingSoon />} />
                <Route path="/smart-apply/job-assist" element={<JobAssistantProtectedRoute><ComingSoon /></JobAssistantProtectedRoute>} />
                <Route path="/smart-apply/interview-prep" element={<JobAssistantProtectedRoute><ComingSoon /></JobAssistantProtectedRoute>} />
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
