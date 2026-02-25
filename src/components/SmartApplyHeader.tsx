import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Sparkles, LogOut, LayoutDashboard, Settings, Crown, Bell } from "lucide-react";
import ibLogoBlack from "@/images/ib-logo-black.png";

const DEEP_BLUE = "#1e3a5f";

function getInitials(fullName: string | null): string {
  if (!fullName || !fullName.trim()) return "";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0].slice(0, 2) || "").toUpperCase();
}

const SmartApplyHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [initials, setInitials] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Read token from localStorage on every render so header updates after login (no stale state)
  const hasToken = !!localStorage.getItem("smart_apply_token");

  const handleLogout = () => {
    localStorage.removeItem("smart_apply_token");
    localStorage.removeItem("smart_apply_full_name");
    setInitials("");
    navigate("/smart-apply");
  };

  useEffect(() => {
    setInitials(getInitials(localStorage.getItem("smart_apply_full_name")));
  }, [location.pathname, hasToken]);

  return (
    <header className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left: IB logo + Smart Apply */}
          <Link
            to="/smart-apply"
            className="flex items-center gap-3 focus:outline-none group"
          >
            <img
              src={ibLogoBlack}
              alt="IB Innovative Solutions"
              className="h-9 sm:h-10 w-auto"
            />
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5">
                <span
                  className="text-xl sm:text-2xl font-bold tracking-tight"
                  style={{ color: DEEP_BLUE }}
                >
                  Smart Apply
                </span>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500" aria-hidden />
              </span>
              <span
                className="text-xs sm:text-sm font-medium tracking-wide"
                style={{ color: DEEP_BLUE }}
              >
                Apply to many companies at once
              </span>
            </div>
          </Link>

          {/* Right: Nav + Button + Profile */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/smart-apply/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              DASHBOARD
            </Link>
            <Link
              to="/smart-apply/apply"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              APPLY TO MULTIPLE EMAILS
            </Link>
            {!hasToken && (
              <>
                <Link
                  to="/smart-apply/sign-in"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/smart-apply/sign-up"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign up
                </Link>
                <Link
                  to="/recruiter/sign-in"
                  className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Are you a recruiter?
                </Link>
              </>
            )}
            <Link
              to="/smart-apply/jobs"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wide"
            >
              FIND A JOB
            </Link>
            <Link
              to="/smart-apply/cv-builder"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-wide"
            >
              CV Builder
            </Link>
            <Link
              to="/smart-apply/premium"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1 uppercase tracking-wide"
            >
              <Crown className="h-4 w-4" />
              Upgrade
            </Link>
            {hasToken ? (
              <>
                <Link
                  to="/smart-apply/notifications"
                  className="flex items-center justify-center w-9 h-9 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-center w-9 h-9 rounded-full text-white p-0 text-sm font-semibold"
                      style={{ backgroundColor: DEEP_BLUE }}
                      title="Profile menu"
                    >
                      {initials ? initials : <User className="h-5 w-5" />}
                    </Button>
                  </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/smart-apply/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/smart-apply/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/smart-apply/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </>
            ) : null}
          </div>

          {/* Mobile menu button */}
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
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white py-4 px-4 shadow-lg">
          <nav className="flex flex-col gap-3">
            <Link
              to="/smart-apply/dashboard"
              className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/smart-apply/apply"
              className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              onClick={() => setMobileMenuOpen(false)}
            >
              APPLY TO MULTIPLE EMAILS
            </Link>
            {!hasToken && (
              <>
                <Link
                  to="/smart-apply/sign-in"
                  className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/smart-apply/sign-up"
                  className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
                <Link
                  to="/recruiter/sign-in"
                  className="py-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Are you a recruiter?
                </Link>
              </>
            )}
            <Link
              to="/smart-apply/jobs"
              className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900 uppercase tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              FIND A JOB
            </Link>
            <Link
              to="/smart-apply/cv-builder"
              className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900 uppercase tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              CV Builder
            </Link>
            <Link
              to="/smart-apply/cv-builder"
              className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900 uppercase tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              CV Builder
            </Link>
            <Link
              to="/smart-apply/premium"
              className="py-2 text-sm font-medium text-amber-600 hover:text-amber-700 flex items-center gap-2 uppercase tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Crown className="h-4 w-4" /> Upgrade
            </Link>
            {hasToken && (
              <>
                <Link
                  to="/smart-apply/notifications"
                  className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell className="h-4 w-4" /> Notifications
                </Link>
                <Link
                  to="/smart-apply/profile"
                  className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  to="/smart-apply/settings"
                  className="py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button
                  type="button"
                  className="py-2 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-2 text-left w-full"
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Deep blue bottom bar (like vico.net) */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: DEEP_BLUE }}
        aria-hidden
      />
    </header>
  );
};

export default SmartApplyHeader;
