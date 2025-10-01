import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Notebook, BookOpen, Users, FileText, Bell, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

// Helper function to generate initials from name
const getInitials = (name: string): string => {
  if (!name || name === "Learner") return "L";
  
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

const LearnerHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userName = user?.fullName || user?.name || user?.email || "Learner";

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
    navigate('/learner/login');
  };

  return (
    <header className="w-full px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <Link to="/learner/dashboard" className="text-xl font-bold text-gray-900">Learner Portal</Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/learner/dashboard" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</Link>
          <Link to="/learner/subjects" className="text-gray-700 hover:text-blue-600 transition-colors">Subjects</Link>
          <Link to="/learner/tutorials" className="text-gray-700 hover:text-blue-600 transition-colors">Tutorials</Link>
          <Link to="/learner/tutors" className="text-gray-700 hover:text-blue-600 transition-colors">Tutors</Link>
          <Link to="/learner/notes" className="text-gray-700 hover:text-blue-600 transition-colors">Notes</Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && (
            <>
              <Link to="/learner/dashboard">
                <Button variant="ghost" size="icon" className="relative">
                  <Calendar className="h-5 w-5 text-gray-700" />
                </Button>
              </Link>
              <Link to="/learner/dashboard">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {getInitials(userName)}
                </span>
              </div>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} className="bg-[whitesmoke] border-gray-300 text-gray-700 hover:bg-gray-200">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Mobile toggle */}
        <Button variant="ghost" size="icon" className="md:hidden text-gray-700" onClick={()=>setIsMobileMenuOpen(v=>!v)}>
          {isMobileMenuOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 border-t border-gray-200">
          {isAuthenticated && (
            <div className="flex items-center justify-center py-3 border-b border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {getInitials(userName)}
                </span>
              </div>
            </div>
          )}
          <nav className="flex flex-col py-3 space-y-2">
            <Link to="/learner/dashboard" onClick={()=>setIsMobileMenuOpen(false)} className="py-2 text-gray-700 hover:text-blue-600">Dashboard</Link>
            <Link to="/learner/subjects" onClick={()=>setIsMobileMenuOpen(false)} className="py-2 text-gray-700 hover:text-blue-600">Subjects</Link>
            <Link to="/learner/tutorials" onClick={()=>setIsMobileMenuOpen(false)} className="py-2 text-gray-700 hover:text-blue-600">Tutorials</Link>
            <Link to="/learner/tutors" onClick={()=>setIsMobileMenuOpen(false)} className="py-2 text-gray-700 hover:text-blue-600">Tutors</Link>
            <Link to="/learner/notes" onClick={()=>setIsMobileMenuOpen(false)} className="py-2 text-gray-700 hover:text-blue-600">Notes</Link>
            <Button variant="outline" onClick={handleLogout} className="mt-2 bg-[whitesmoke] border-gray-300 text-gray-700 hover:bg-gray-200">Logout</Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default LearnerHeader;


