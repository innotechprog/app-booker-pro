import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { recruiterApi } from "@/services/recruiterApi";
import ibLogoBlack from "@/images/ib-logo-black.png";

const DEEP_BLUE = "#1e3a5f";

const RecruiterHeader = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasToken = recruiterApi.hasToken();

  const handleLogout = () => {
    recruiterApi.logout();
    navigate("/smart-apply/sign-in?mode=recruiter");
  };

  return (
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
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/recruiter" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Talent search
          </Link>
          {hasToken ? (
            <>
              <Link to="/recruiter/jobs" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Jobs
              </Link>
              <Link to="/recruiter/recruitments" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Recruitments
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-9 h-9 rounded-full text-white p-0"
                    style={{ backgroundColor: DEEP_BLUE }}
                    title="Profile menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/recruiter/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/recruiter/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/smart-apply/sign-in?mode=recruiter" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Button asChild size="sm" className="text-white" style={{ backgroundColor: DEEP_BLUE }}>
                <Link to="/smart-apply/sign-up?mode=recruiter">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden p-2 text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 py-4 px-4 flex flex-col gap-2">
          <Link to="/recruiter" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
            Talent search
          </Link>
          {hasToken ? (
            <>
              <Link to="/recruiter/jobs" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                Jobs
              </Link>
              <Link to="/recruiter/recruitments" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                Recruitments
              </Link>
              <Link to="/recruiter/profile" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/recruiter/settings" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                Settings
              </Link>
              <button type="button" className="py-2 text-sm font-medium text-red-600 text-left" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/smart-apply/sign-in?mode=recruiter" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                Sign in
              </Link>
              <Link to="/smart-apply/sign-up?mode=recruiter" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileMenuOpen(false)}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default RecruiterHeader;
