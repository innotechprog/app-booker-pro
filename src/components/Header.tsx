import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ibLogoWhite from "@/images/ib-logo-white.png";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/education", label: "Education" },
  { to: "/book-service", label: "Send Me" },
  { to: "/it-solutions", label: "IT Solutions" },
  { to: "/smart-apply", label: "Job Assistant" },
  { to: "/jobs", label: "Jobs" },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to get link classes
  const getLinkClasses = (path: string) => {
    const baseClasses = "transition-colors font-medium text-sm";
    const activeClasses = "text-foreground font-semibold";
    const inactiveClasses = "text-foreground/70 hover:text-foreground";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  const isEducationPage = location.pathname.startsWith("/education");

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="relative w-full border-b border-border/60 bg-background">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center">
          <Link to="/" className="flex items-center focus:outline-none">
            <img
              src={ibLogoWhite}
              alt="IB Innovative Solutions - IBIS"
              className="h-8 sm:h-9 w-auto"
            />
          </Link>
        </div>
      
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to} className={getLinkClasses(item.to)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side - Login Button (show on Education and Universities pages) */}
        {(isActive("/education") || isActive("/universities")) && (
          <div className="hidden md:flex items-center">
            <Button
              variant="outlineLight"
              className="h-9 rounded-md px-4"
              onClick={() => {
                if (isEducationPage) {
                  navigate("/coming-soon");
                  return;
                }
                navigate("/learner/login");
              }}
            >
              Login
            </Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-border/60 bg-background shadow-sm md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col space-y-1 px-4 py-3 sm:px-6">
            {NAV_ITEMS.map((item) => (
              <Link key={item.to} to={item.to} className={`${getLinkClasses(item.to)} rounded-md px-2 py-2`} onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            
            {(isActive("/education") || isActive("/universities")) && (
              <div className="pt-4 border-t border-border space-y-3">
                <Button
                  variant="outlineLight"
                  className="h-9 w-full rounded-md"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (isEducationPage) {
                      navigate("/coming-soon");
                      return;
                    }
                    navigate("/learner/login");
                  }}
                >
                  Login
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;