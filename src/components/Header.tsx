import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X, User, LogOut, BookOpen, GraduationCap, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Helper function to generate initials from name
const getInitials = (name: string): string => {
  if (!name || name === "User") return "U";
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const rawLearnerData = localStorage.getItem('learnerData') || localStorage.getItem('learner_current');
      if (rawLearnerData) {
        setIsLoggedIn(true);
        try {
          setUserData(JSON.parse(rawLearnerData));
        } catch {
          setUserData({});
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkLoginStatus();
    
    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);
    
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('learnerData');
    localStorage.removeItem('learner_current');
    setIsLoggedIn(false);
    setUserData(null);
    navigate('/');
  };

  return (
    <header className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 border-b border-white/10">
      <div className="flex items-center justify-between">
      <div className="flex items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
          IBIS<span className="text-primary">.</span>
        </h1>
      </div>
      
        {/* Desktop Navigation - Conditional based on login status */}
      <nav className="hidden md:flex items-center space-x-8">
          {isLoggedIn ? (
            <>
              <Link to="/education" className="text-foreground hover:text-primary transition-colors font-medium">
                Education
              </Link>
              <Link to="/tutorials" className="text-foreground hover:text-primary transition-colors font-medium">
                Tutorials
              </Link>
              <Link to="/tutorials/available" className="text-foreground hover:text-primary transition-colors font-medium">
                Browse Tutorials
              </Link>
              <Link to="/learner/dashboard" className="text-foreground hover:text-primary transition-colors font-medium">
                Dashboard
              </Link>
              <Link to="/learner/profile" className="text-foreground hover:text-primary transition-colors font-medium">
                Profile
              </Link>
              <Link to="/learner/tutorials" className="text-foreground hover:text-primary transition-colors font-medium">
                My Tutorials
              </Link>
              <Link to="/learner/tutors" className="text-foreground hover:text-primary transition-colors font-medium">
                Tutors
              </Link>
              <Link to="/learner/notes" className="text-foreground hover:text-primary transition-colors font-medium">
                Notes
              </Link>
            </>
          ) : (
            <>
              <Link to="/education" className="text-foreground hover:text-primary transition-colors font-medium">
                Education
              </Link>
              <Link to="/tutorials" className="text-foreground hover:text-primary transition-colors font-medium">
                Tutorials
              </Link>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors font-medium">
                Contact
              </a>
            </>
          )}
        </nav>

        {/* Right side - Login/User Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-foreground hover:text-primary">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {getInitials(userData?.name || userData?.fullName || 'User')}
                      </span>
                    </div>
                    <span className="font-medium">{userData?.name || userData?.fullName || 'User'}</span>
                    <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userData?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{userData?.email || 'user@example.com'}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/learner/dashboard" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/tutorials/available" className="w-full cursor-pointer">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Tutorials
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/education" className="w-full cursor-pointer">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Education Services
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
              
              {/* Send Me Button */}
              <Button asChild className="bg-transparent hover:bg-white/20 text-white hover:text-white border border-white hover:border-white rounded-full px-6 py-2">
                <Link to="/book-service">Send Me</Link>
              </Button>
            </>
          ) : (
            <>
              {/* Login Button */}
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Link to="/learner/login">Login</Link>
              </Button>
              
              {/* Send Me Button */}
              <Button asChild className="bg-transparent hover:bg-white/20 text-white hover:text-white border border-white hover:border-white rounded-full px-6 py-2">
                <Link to="/book-service">Send Me</Link>
              </Button>
            </>
          )}
        </div>

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

      {/* Mobile Navigation - Conditional based on login status */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/40 border-t border-white/10 md:hidden z-50">
          <nav className="flex flex-col space-y-4 p-4">
            {isLoggedIn ? (
              <>
                <Link to="/education" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Education</Link>
                <Link 
                  to="/tutorials" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tutorials
                </Link>
                <Link 
                  to="/tutorials/available" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Tutorials
                </Link>
                <Link to="/learner/dashboard" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                <Link to="/learner/profile" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
                <Link to="/learner/tutorials" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>My Tutorials</Link>
                <Link to="/learner/tutors" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Tutors</Link>
                <Link to="/learner/notes" className="text-foreground hover:text-primary transition-colors font-medium py-2" onClick={() => setIsMobileMenuOpen(false)}>Notes</Link>
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="px-2 py-1">
                    <p className="text-sm font-medium text-foreground">{userData?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{userData?.email || 'user@example.com'}</p>
                  </div>
                  <Button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    variant="outline" 
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                  <Button asChild className="w-full bg-transparent hover:bg-white/20 text-white hover:text-white border border-white hover:border-white rounded-full">
                    <Link to="/book-service" onClick={() => setIsMobileMenuOpen(false)}>
                      Send Me
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/education" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Education
                </Link>
                <Link 
                  to="/tutorials" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tutorials
                </Link>
                <a 
                  href="#contact" 
                  className="text-foreground hover:text-primary transition-colors font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
          Contact
        </a>
                <div className="pt-4 border-t border-border space-y-3">
                  <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                    <Link to="/learner/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Login
                    </Link>
                  </Button>
                  <Button asChild className="w-full bg-transparent hover:bg-white/20 text-white hover:text-white border border-white hover:border-white rounded-full">
                    <Link to="/book-service" onClick={() => setIsMobileMenuOpen(false)}>
                      Send Me
                    </Link>
                  </Button>
                </div>
              </>
            )}
      </nav>
        </div>
      )}
    </header>
  );
};

export default Header;