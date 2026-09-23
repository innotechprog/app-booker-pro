import { useLocation } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import Header from "./Header";
import JobAssistantHeader from "./JobAssistantHeader";
import RecruiterHeader from "./RecruiterHeader";
import RecruiterGuestHeader from "./RecruiterGuestHeader";
import { recruiterApi } from "@/services/recruiterApi";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const hasSmartApplyToken = !!localStorage.getItem("smart_apply_token");
  const heroHeaderPaths = new Set([
    "/",
    "/contact",
    "/education",
    "/it-solutions",
    "/book-service",
    "/about",
    "/privacy",
    "/terms",
    "/cookies",
    "/coming-soon",
    "/jobs",
    "/smart-apply/jobs",
    "/smart-apply/job-assist",
    "/smart-apply/interview-prep",
  ]);
  const isHeroHeaderPath = heroHeaderPaths.has(location.pathname);
  const isSmartApplyPath = location.pathname.startsWith("/smart-apply");
  const isJobsPath =
    location.pathname === "/jobs" ||
    location.pathname.startsWith("/jobs/") ||
    location.pathname === "/smart-apply/jobs" ||
    location.pathname.startsWith("/smart-apply/jobs/") ||
    location.pathname.startsWith("/smart-apply/job/");
  const isSmartApply = isSmartApplyPath && hasSmartApplyToken;
  const isRecruiter = location.pathname.startsWith("/recruiter");
  const useOverlayHeader = isHeroHeaderPath && !isRecruiter && !isSmartApply;
  const headerWrapperClass = useOverlayHeader ? "fixed inset-x-0 top-0 z-50" : "sticky top-0 z-50";

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Header Section - Recruiter and Job Assistant get their own headers */}
      <div className={headerWrapperClass}>
        {isRecruiter ? (
          recruiterApi.hasToken() ? (
            <RecruiterHeader />
          ) : (
            <RecruiterGuestHeader />
          )
        ) : isSmartApply ? (
          <JobAssistantHeader />
        ) : (
          <Header />
        )}
      </div>
      {/* Main Content Section - Takes remaining space */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
