import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import ibLogoWhite from "@/images/ib-logo-white.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Helper function to get link classes
  const getLinkClasses = (path: string) => {
    const baseClasses = "transition-colors font-medium";
    const activeClasses = "text-primary font-semibold";
    const inactiveClasses = "text-foreground hover:text-primary";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <header className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 border-b border-white/10">
      <div className="flex items-center justify-between">
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
      <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className={getLinkClasses("/")}>
            Home
          </Link>
          <Link to="/education" className={getLinkClasses("/education")}>
            Education
          </Link>
          <Link to="/book-service" className={getLinkClasses("/book-service")}>
            Send Me
          </Link>
          <Link to="/it-solutions" className={getLinkClasses("/it-solutions")}>
            IT Solutions
          </Link>
          <Link to="/smart-apply" className={getLinkClasses("/smart-apply")}>
            Smart Apply
          </Link>
        </nav>

        {/* Right side - Login Button (show on Education and Universities pages) */}
        {(isActive("/education") || isActive("/universities")) && (
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-primary border-2 rounded-full px-6 py-2">
              <Link to="/learner/login">Login</Link>
            </Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
        <div className="absolute top-full left-0 right-0 bg-gradient-to-br from-[#101a3c] to-[#0a0f1c] border-t border-white/10 md:hidden z-50 shadow-lg">
          <nav className="flex flex-col space-y-4 p-4">
            <Link to="/" className={`${getLinkClasses("/")} py-2`} onClick={() => setIsMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/education" className={`${getLinkClasses("/education")} py-2`} onClick={() => setIsMobileMenuOpen(false)}>
              Education
            </Link>
            <Link to="/book-service" className={`${getLinkClasses("/book-service")} py-2`} onClick={() => setIsMobileMenuOpen(false)}>
              Send Me
            </Link>
            <Link to="/it-solutions" className={`${getLinkClasses("/it-solutions")} py-2`} onClick={() => setIsMobileMenuOpen(false)}>
              IT Solutions
            </Link>
            <Link to="/smart-apply" className={`${getLinkClasses("/smart-apply")} py-2`} onClick={() => setIsMobileMenuOpen(false)}>
              Smart Apply
            </Link>
            
            {(isActive("/education") || isActive("/universities")) && (
              <div className="pt-4 border-t border-border space-y-3">
                <Button asChild variant="outline" className="w-full border-white text-white hover:bg-white hover:text-primary border-2 rounded-full">
                  <Link to="/learner/login" onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
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