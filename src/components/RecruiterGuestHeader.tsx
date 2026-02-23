import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ibLogoBlack from "@/images/ib-logo-black.png";

const DEEP_BLUE = "#1e3a5f";

const RecruiterGuestHeader = () => (
  <header className="w-full bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
      <Link to="/recruiter" className="flex items-center gap-3 focus:outline-none">
        <img
          src={ibLogoBlack}
          alt="IB Innovative Solutions"
          className="h-9 sm:h-10 w-auto"
        />
        <span className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: DEEP_BLUE }}>
          Smart Apply Recruiter
        </span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link to="/smart-apply/sign-in?mode=recruiter" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Sign in
        </Link>
        <Button asChild size="sm" className="text-white" style={{ backgroundColor: DEEP_BLUE }}>
          <Link to="/smart-apply/sign-up?mode=recruiter">Sign up</Link>
        </Button>
      </nav>
    </div>
  </header>
);

export default RecruiterGuestHeader;
