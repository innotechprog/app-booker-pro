import { useLocation } from "react-router-dom";
import ScrollToTop from "./ScrollToTop";
import Header from "./Header";
import SmartApplyHeader from "./SmartApplyHeader";
import RecruiterHeader from "./RecruiterHeader";
import RecruiterGuestHeader from "./RecruiterGuestHeader";
import { recruiterApi } from "@/services/recruiterApi";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const isSmartApply = location.pathname.startsWith("/smart-apply");
  const isRecruiter = location.pathname.startsWith("/recruiter");

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {/* Header Section - Recruiter and Smart Apply get their own headers */}
      <div className="sticky top-0 z-50">
        {isRecruiter ? (
          recruiterApi.hasToken() ? (
            <RecruiterHeader />
          ) : (
            <RecruiterGuestHeader />
          )
        ) : isSmartApply ? (
          <SmartApplyHeader />
        ) : (
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            <Header />
          </div>
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
