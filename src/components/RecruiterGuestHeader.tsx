import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ibLogoBlack from "@/images/ib-logo-black.png";

const DEEP_BLUE = "#1e3a5f";

const RecruiterGuestHeader = () => (
  <header className="w-full px-4 pt-4 sm:px-6">
    <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:px-6">
      <Link to="/recruiter" className="flex items-center gap-3 focus:outline-none">
        <img
          src={ibLogoBlack}
          alt="IB Innovative Solutions"
          className="h-9 sm:h-10 w-auto"
        />
        <span className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: DEEP_BLUE }}>
          Job Assistant Recruiter
        </span>
      </Link>
      <nav className="flex items-center gap-4">
        <Link to="/recruiter/sign-in" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Sign in
        </Link>
        <Button asChild size="sm" className="text-white" style={{ backgroundColor: DEEP_BLUE }}>
          <Link to="/recruiter/sign-in?mode=sign-up">Sign up</Link>
        </Button>
      </nav>
    </div>
  </header>
);

export default RecruiterGuestHeader;
