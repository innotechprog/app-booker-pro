import { ReactNode } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Bell, Calendar, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
}

// Helper function to generate initials from name
const getInitials = (name: string): string => {
  if (!name || name === "User") return "U";
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userName = user?.fullName || user?.name || user?.email || "User";

  useEffect(() => {
    // Check notifications count
    const checkNotifications = () => {
      if (user?.email) {
        const notifications = JSON.parse(localStorage.getItem(`notifications_${user.email}`) || "[]");
        const unread = notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    };
    
    checkNotifications();
    const interval = setInterval(checkNotifications, 3000);
    
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Helper function to get link classes
  const getLinkClasses = (path: string) => {
    const baseClasses = "transition-colors px-3 py-2 rounded-lg text-sm font-medium";
    const activeClasses = "text-white bg-white/20 font-semibold";
    const inactiveClasses = "text-gray-300 hover:text-white hover:bg-white/10";
    
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  IBIS<span className="text-blue-400">.</span> Dashboard
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <nav className="flex items-center space-x-2">
                  <Link to="/learner/dashboard" className={getLinkClasses("/learner/dashboard")}>
                    Dashboard
                  </Link>
                  <Link to="/learner/subjects" className={getLinkClasses("/learner/subjects")}>
                    Subjects
                  </Link>
                  <Link to="/learner/tutorials" className={getLinkClasses("/learner/tutorials")}>
                    Tutorials
                  </Link>
                  <Link to="/learner/tutors" className={getLinkClasses("/learner/tutors")}>
                    Tutors
                  </Link>
                  <Link to="/learner/notes" className={getLinkClasses("/learner/notes")}>
                    Notes
                  </Link>
                  <Link to="/learner/packages" className={getLinkClasses("/learner/packages")}>
                    Packages
                  </Link>
                </nav>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 text-white hover:text-blue-300 hover:bg-white/10 rounded-lg px-3 py-2"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {getInitials(userName)}
                        </span>
                      </div>
                      <span className="font-medium">{userName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg z-[9999]">
                    <div className="px-2 py-1.5 bg-gray-50">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-600">{user?.email || 'user@example.com'}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="hover:bg-gray-100">
                      <Link to="/learner/dashboard" className="w-full cursor-pointer text-gray-900 hover:text-gray-900 flex items-center px-2 py-1.5">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-auto h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-gray-100">
                      <Link to="/learner/dashboard" className="w-full cursor-pointer text-gray-900 hover:text-gray-900 flex items-center px-2 py-1.5">
                        <Calendar className="mr-2 h-4 w-4" />
                        Calendar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-gray-100">
                      <Link to="/learner/profile" className="w-full cursor-pointer text-gray-900 hover:text-gray-900 flex items-center px-2 py-1.5">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-gray-900 hover:text-gray-900 hover:bg-gray-100 flex items-center px-2 py-1.5">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden p-2 text-white"
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
              <div className="md:hidden mt-4 pt-4 border-t border-white/20">
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-white/20">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {getInitials(userName)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{userName}</p>
                    <p className="text-gray-300 text-xs">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>

                <nav className="flex flex-col space-y-2">
                  <Link 
                    to="/learner/dashboard" 
                    className={getLinkClasses("/learner/dashboard")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/learner/subjects" 
                    className={getLinkClasses("/learner/subjects")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Subjects
                  </Link>
                  <Link 
                    to="/learner/tutorials" 
                    className={getLinkClasses("/learner/tutorials")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tutorials
                  </Link>
                  <Link 
                    to="/learner/tutors" 
                    className={getLinkClasses("/learner/tutors")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Tutors
                  </Link>
                  <Link 
                    to="/learner/notes" 
                    className={getLinkClasses("/learner/notes")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Notes
                  </Link>
                  <Link 
                    to="/learner/packages" 
                    className={getLinkClasses("/learner/packages")}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Packages
                  </Link>
                </nav>

                {/* Profile Options */}
                <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
                  <Link 
                    to="/learner/dashboard" 
                    className="flex items-center text-gray-300 hover:text-white transition-colors px-3 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                    {unreadCount > 0 && (
                      <span className="ml-auto h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    to="/learner/dashboard" 
                    className="flex items-center text-gray-300 hover:text-white transition-colors px-3 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendar
                  </Link>
                  <Link 
                    to="/learner/profile" 
                    className="flex items-center text-gray-300 hover:text-white transition-colors px-3 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center text-gray-300 hover:text-red-300 transition-colors px-3 py-2 w-full text-left"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
