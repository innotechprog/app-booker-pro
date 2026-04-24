import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, Sparkles, LogOut, LayoutDashboard, Settings, Crown, Bell, Wand2, Mic } from "lucide-react";
import ibLogoBlack from "@/images/ib-logo-black.png";
import { smartApplyAPI } from "@/services/api";

const DEEP_BLUE = "#1e3a5f";
const PROFILE_PIC_KEY = "smart_apply_profile_picture";

function getInitials(fullName: string | null): string {
  if (!fullName || !fullName.trim()) return "";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0].slice(0, 2) || "").toUpperCase();
}

const SmartApplyHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [initials, setInitials] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Read token from localStorage on every render so header updates after login (no stale state)
  const hasToken = !!localStorage.getItem("smart_apply_token");

  const isActivePath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const desktopNavClass = (path: string, inactiveClass = "text-gray-500 hover:text-gray-900", activeClass = "text-gray-900") =>
    `text-sm font-medium transition-colors ${isActivePath(path) ? activeClass : inactiveClass}`;

  const mobileNavClass = (path: string, inactiveClass = "text-gray-600 hover:text-gray-900", activeClass = "text-gray-900") =>
    `py-2 text-sm font-medium transition-colors ${isActivePath(path) ? activeClass : inactiveClass}`;

  const handleLogout = () => {
    localStorage.removeItem("smart_apply_token");
    localStorage.removeItem("smart_apply_full_name");
    localStorage.removeItem(PROFILE_PIC_KEY);
    setInitials("");
    setProfilePictureUrl(null);
    navigate("/smart-apply/sign-in");
  };

  const loadProfilePicture = () => {
    const stored = localStorage.getItem(PROFILE_PIC_KEY);
    setProfilePictureUrl(stored ? `data:image/jpeg;base64,${stored}` : null);
  };

  useEffect(() => {
    if (!hasToken) {
      setProfilePictureUrl(null);
      setInitials("");
      return;
    }
    setInitials(getInitials(localStorage.getItem("smart_apply_full_name")));
    loadProfilePicture();
    // Fetch profile from API when no picture in localStorage (e.g. returning user)
    if (!localStorage.getItem(PROFILE_PIC_KEY)) {
      smartApplyAPI.getProfile().then((res: { profile?: { profilePicture?: string } }) => {
        const raw = res?.profile?.profilePicture;
        if (typeof raw === "string" && raw) {
          const b64 = raw.startsWith("data:") ? raw.split(",")[1] : raw;
          localStorage.setItem(PROFILE_PIC_KEY, b64);
          setProfilePictureUrl(`data:image/jpeg;base64,${b64}`);
        }
      }).catch(() => {});
    }
  }, [location.pathname, hasToken]);

  useEffect(() => {
    const handler = () => loadProfilePicture();
    window.addEventListener("smart-apply-profile-picture-updated", handler);
    return () => window.removeEventListener("smart-apply-profile-picture-updated", handler);
  }, []);

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

            </div>
          </Link>

          {/* Right: Nav + Button + Profile */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/smart-apply/dashboard"
              className={desktopNavClass("/smart-apply/dashboard")}
              data-tour="nav-dashboard"
            >
              DASHBOARD
            </Link>
            <Link
              to="/smart-apply/apply"
              className={desktopNavClass("/smart-apply/apply")}
              data-tour="nav-apply"
              title="APPLY TO MULTIPLE EMAILS"
            >
              SMART APPLY
            </Link>
            {!hasToken && (
              <>
                <Link
                  to="/smart-apply/sign-in"
                  className={desktopNavClass("/smart-apply/sign-in", "text-gray-600 hover:text-gray-900")}
                >
                  Sign in
                </Link>
                <Link
                  to="/smart-apply/sign-up"
                  className={desktopNavClass("/smart-apply/sign-up", "text-gray-600 hover:text-gray-900")}
                >
                  Sign up
                </Link>
                <Link
                  to="/recruiter/sign-in"
                  className={desktopNavClass("/recruiter/sign-in")}
                >
                  Are you a recruiter?
                </Link>
              </>
            )}
            <Link
              to="/smart-apply/jobs"
              className={`${desktopNavClass("/smart-apply/jobs")} uppercase tracking-wide`}
              data-tour="nav-jobs"
            >
              FIND A JOB
            </Link>
            <Link
              to="/smart-apply/cv-builder"
              className={`${desktopNavClass("/smart-apply/cv-builder")} uppercase tracking-wide`}
              data-tour="nav-cv-builder"
            >
              CV Builder
            </Link>
            <Link
              to="/smart-apply/job-assist"
              className={`${desktopNavClass("/smart-apply/job-assist")} flex items-center gap-1 uppercase tracking-wide`}
            >
              <Wand2 className="h-4 w-4" />
              Job Assist
            </Link>
            <Link
              to="/smart-apply/interview-prep"
              className={`${desktopNavClass("/smart-apply/interview-prep")} flex items-center gap-1 uppercase tracking-wide`}
              data-tour="nav-interview-prep"
            >
              <Mic className="h-4 w-4" />
              Interview Prep
            </Link>
            <Link
              to="/smart-apply/premium"
              className={`${desktopNavClass("/smart-apply/premium", "text-amber-600 hover:text-amber-700", "text-amber-700")} flex items-center gap-1 uppercase tracking-wide`}
            >
              <Crown className="h-4 w-4" />
              Upgrade
            </Link>
            {hasToken ? (
              <>
                <Link
                  to="/smart-apply/notifications"
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-colors ${
                    isActivePath("/smart-apply/notifications")
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden text-white p-0 text-sm font-semibold shrink-0"
                      style={{ backgroundColor: profilePictureUrl ? undefined : DEEP_BLUE }}
                      title="Profile menu"
                    >
                      {profilePictureUrl ? (
                        <img src={profilePictureUrl} alt="" className="w-full h-full object-cover" />
                      ) : initials ? (
                        initials
                      ) : (
                        <User className="h-5 w-5" />
                      )}
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

          {/* Mobile menu button - id used by SmartApplyTour to open menu on mobile */}
          <Button
            id="smart-apply-mobile-menu-btn"
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
              className={mobileNavClass("/smart-apply/dashboard")}
              data-tour="nav-dashboard"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/smart-apply/apply"
              className={mobileNavClass("/smart-apply/apply")}
              data-tour="nav-apply"
              title="APPLY TO MULTIPLE EMAILS"
              onClick={() => setMobileMenuOpen(false)}
            >
              SMART APPLY
            </Link>
            {!hasToken && (
              <>
                <Link
                  to="/smart-apply/sign-in"
                  className={mobileNavClass("/smart-apply/sign-in")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/smart-apply/sign-up"
                  className={mobileNavClass("/smart-apply/sign-up")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
                <Link
                  to="/recruiter/sign-in"
                  className={mobileNavClass("/recruiter/sign-in", "text-gray-500 hover:text-gray-900")}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Are you a recruiter?
                </Link>
              </>
            )}
            <Link
              to="/smart-apply/jobs"
              className={`${mobileNavClass("/smart-apply/jobs")} uppercase tracking-wide`}
              data-tour="nav-jobs"
              onClick={() => setMobileMenuOpen(false)}
            >
              FIND A JOB
            </Link>
            <Link
              to="/smart-apply/cv-builder"
              className={`${mobileNavClass("/smart-apply/cv-builder")} uppercase tracking-wide`}
              data-tour="nav-cv-builder"
              onClick={() => setMobileMenuOpen(false)}
            >
              CV Builder
            </Link>
            <Link
              to="/smart-apply/job-assist"
              className={`${mobileNavClass("/smart-apply/job-assist")} flex items-center gap-2 uppercase tracking-wide`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Wand2 className="h-4 w-4" /> Job Assist
            </Link>
            <Link
              to="/smart-apply/interview-prep"
              className={`${mobileNavClass("/smart-apply/interview-prep")} flex items-center gap-2 uppercase tracking-wide`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Mic className="h-4 w-4" /> Interview Prep
            </Link>
            <Link
              to="/smart-apply/premium"
              className={`${mobileNavClass("/smart-apply/premium", "text-amber-600 hover:text-amber-700", "text-amber-700")} flex items-center gap-2 uppercase tracking-wide`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Crown className="h-4 w-4" /> Upgrade
            </Link>
            {hasToken && (
              <>
                <Link
                  to="/smart-apply/notifications"
                  className={`${mobileNavClass("/smart-apply/notifications")} flex items-center gap-2`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Bell className="h-4 w-4" /> Notifications
                </Link>
                <Link
                  to="/smart-apply/profile"
                  className={`${mobileNavClass("/smart-apply/profile")} flex items-center gap-2`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  to="/smart-apply/settings"
                  className={`${mobileNavClass("/smart-apply/settings")} flex items-center gap-2`}
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
