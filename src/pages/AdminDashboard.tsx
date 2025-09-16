import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Users, 
  Calendar, 
  Clock, 
  MapPin, 
  LogOut, 
  Plus, 
  History,
  Settings,
  Home,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
  Receipt,
  TrendingUp,
  UserCheck,
  Package,
  Shield,
  BarChart3,
  Filter,
  Search,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  FileText,
  Download,
  Printer,
  UserPlus
} from "lucide-react";
import SEO from "@/components/SEO";

interface Booking {
  id: string;
  serviceType: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: string;
  createdAt: string;
  estimatedCost: number;
  urgency: string;
  specificService?: string;
  customService?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  userEmail?: string;
  userPhone?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
  provider?: string;
  role: 'super-admin' | 'admin' | 'manager' | 'agent';
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  applicationId?: string;
}

interface AgentApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  experience: string;
  motivation: string;
  documents: {
    criminalRecord: string;
    idDocument: string;
    fingerprintCheck: string;
    profilePicture: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  assignedDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
}

interface Invoice {
  id: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  dueDate: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  activeUsers: number;
  todayBookings: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
}

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    todayBookings: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "agent" as 'super-admin' | 'admin' | 'manager' | 'agent',
    status: "active" as 'active' | 'inactive'
  });
  const [agentApplications, setAgentApplications] = useState<AgentApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<AgentApplication | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin authentication
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/login");
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = () => {
    // Load bookings
    const bookingsData = JSON.parse(localStorage.getItem("bookings") || "[]");
    setBookings(bookingsData);

    // Load users (simulate user data)
    const usersData = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+27 123 456 789",
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        role: "super-admin" as const,
        status: "active" as const,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+27 987 654 321",
        joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        provider: "google",
        role: "admin" as const,
        status: "active" as const,
        lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        name: "Mike Johnson",
        email: "mike@example.com",
        phone: "+27 555 123 456",
        joinDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        role: "manager" as const,
        status: "active" as const,
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        name: "Sarah Wilson",
        email: "sarah@example.com",
        phone: "+27 777 888 999",
        joinDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        role: "agent" as const,
        status: "active" as const,
        lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        name: "David Brown",
        email: "david@example.com",
        phone: "+27 111 222 333",
        joinDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        role: "agent" as const,
        status: "inactive" as const,
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      ...bookingsData.map((booking: Booking, index: number) => ({
        id: `user-${index + 6}`,
        name: booking.userEmail?.split("@")[0] || `User ${index + 6}`,
        email: booking.userEmail || `user${index + 6}@example.com`,
        phone: booking.userPhone || `+27 ${Math.floor(Math.random() * 900000000) + 100000000}`,
        joinDate: booking.createdAt,
        role: "agent" as const,
        status: "active" as const,
        lastLogin: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      }))
    ];
    setUsers(usersData);

    // Calculate stats
    const today = new Date().toDateString();
    const todayBookings = bookingsData.filter((booking: Booking) => 
      new Date(booking.createdAt).toDateString() === today
    ).length;

    const totalRevenue = bookingsData.reduce((sum: number, booking: Booking) => 
      sum + (booking.estimatedCost || 0), 0
    );

    const pendingBookings = bookingsData.filter((booking: Booking) => 
      ["pending", "confirmed"].includes(booking.status)
    ).length;

    const completedBookings = bookingsData.filter((booking: Booking) => 
      ["completed"].includes(booking.status)
    ).length;

    // Load invoices
    let invoicesData = JSON.parse(localStorage.getItem("invoices") || "[]");
    
    // Generate sample invoices if none exist
    if (invoicesData.length === 0) {
      invoicesData = [
        {
          id: "INV-001",
          bookingId: "BK-001",
          customerName: "John Doe",
          customerEmail: "john@example.com",
          amount: 250,
          status: "paid",
          paymentMethod: "PayFast",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            { description: "Grocery Shopping Service", amount: 200 },
            { description: "Delivery Fee", amount: 50 }
          ]
        },
        {
          id: "INV-002",
          bookingId: "BK-002",
          customerName: "Jane Smith",
          customerEmail: "jane@example.com",
          amount: 180,
          status: "pending",
          paymentMethod: "Bank Transfer",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            { description: "Document Delivery", amount: 150 },
            { description: "Express Service", amount: 30 }
          ]
        },
        {
          id: "INV-003",
          bookingId: "BK-003",
          customerName: "Mike Johnson",
          customerEmail: "mike@example.com",
          amount: 320,
          status: "paid",
          paymentMethod: "PayFast",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            { description: "Event Setup Assistance", amount: 280 },
            { description: "Equipment Transport", amount: 40 }
          ]
        }
      ];
      localStorage.setItem("invoices", JSON.stringify(invoicesData));
    }
    
    setInvoices(invoicesData);

    const totalInvoices = invoicesData.length;
    const paidInvoices = invoicesData.filter((invoice: Invoice) => invoice.status === "paid").length;
    const pendingInvoices = invoicesData.filter((invoice: Invoice) => invoice.status === "pending").length;

    setStats({
      totalBookings: bookingsData.length,
      pendingBookings,
      completedBookings,
      totalRevenue,
      activeUsers: usersData.length,
      todayBookings,
      totalInvoices,
      paidInvoices,
      pendingInvoices
    });

    // Load agent applications
    const applicationsData = JSON.parse(localStorage.getItem("agentApplications") || "[]");
    setAgentApplications(applicationsData);
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    toast.success(`Booking status updated to ${newStatus}`);
    loadData(); // Reload stats
  };

  const handleDeleteBooking = (bookingId: string) => {
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    setBookings(updatedBookings);
    localStorage.setItem("bookings", JSON.stringify(updatedBookings));
    toast.success("Booking deleted successfully");
    loadData(); // Reload stats
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Name and email are required");
      return;
    }

    const userExists = users.find(user => user.email === newUser.email);
    if (userExists) {
      toast.error("User with this email already exists");
      return;
    }

    const newUserData: User = {
      id: `user-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone || undefined,
      role: newUser.role,
      status: newUser.status,
      joinDate: new Date().toISOString(),
      lastLogin: undefined
    };

    const updatedUsers = [...users, newUserData];
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    // Reset form
    setNewUser({
      name: "",
      email: "",
      phone: "",
      role: "agent",
      status: "active"
    });
    setIsNewUserModalOpen(false);
    
    toast.success(`User ${newUserData.name} added successfully`);
  };

  const handleInvoiceStatusUpdate = (invoiceId: string, newStatus: string) => {
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
    );
    setInvoices(updatedInvoices);
    localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
    toast.success(`Invoice status updated to ${newStatus}`);
  };

  const handleApplicationClick = (application: AgentApplication) => {
    setSelectedApplication(application);
    setReviewNotes(application.reviewNotes || "");
    setIsApplicationModalOpen(true);
  };

  const handleApplicationReview = (status: 'approved' | 'rejected') => {
    if (!selectedApplication) return;

    const updatedApplication = {
      ...selectedApplication,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: "Admin", // In a real app, this would be the current admin's name
      reviewNotes: reviewNotes
    };

    const updatedApplications = agentApplications.map(app => 
      app.id === selectedApplication.id ? updatedApplication : app
    );
    setAgentApplications(updatedApplications);
    localStorage.setItem("agentApplications", JSON.stringify(updatedApplications));

    // Update user status if approved
    if (status === 'approved') {
      const updatedUsers = users.map(user => 
        user.applicationId === selectedApplication.id 
          ? { ...user, status: 'active' as const }
          : user
      );
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }

    setIsApplicationModalOpen(false);
    setSelectedApplication(null);
    setReviewNotes("");
    
    toast.success(`Application ${status}`);
  };

  const getUsersReportingTo = (userId: string) => {
    // Simulate users reporting to this user based on role hierarchy
    const roleHierarchy = {
      'super-admin': ['admin', 'manager', 'agent'],
      'admin': ['manager', 'agent'],
      'manager': ['agent'],
      'agent': []
    };
    
    const userRole = users.find(u => u.id === userId)?.role;
    if (!userRole) return [];
    
    const allowedRoles = roleHierarchy[userRole as keyof typeof roleHierarchy] || [];
    return users.filter(u => allowedRoles.includes(u.role) && u.id !== userId);
  };

  const getManager = (userId: string) => {
    const userRole = users.find(u => u.id === userId)?.role;
    if (!userRole) return null;
    
    const managerRoles = {
      'super-admin': null,
      'admin': 'super-admin',
      'manager': 'admin',
      'agent': 'manager'
    };
    
    const managerRole = managerRoles[userRole as keyof typeof managerRoles];
    if (!managerRole) return null;
    
    return users.find(u => u.role === managerRole);
  };

  const getTasksForUser = (userId: string): Task[] => {
    // Simulate tasks for the user
    const taskTypes = ['Booking Management', 'Customer Support', 'Invoice Processing', 'Report Generation', 'Quality Assurance'];
    const statuses = ['completed', 'in-progress', 'pending'] as const;
    
    return Array.from({ length: Math.floor(Math.random() * 8) + 3 }, (_, i) => ({
      id: `task-${userId}-${i + 1}`,
      title: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      description: `Task description for ${taskTypes[Math.floor(Math.random() * taskTypes.length)]}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
      assignedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      completedDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      estimatedHours: Math.floor(Math.random() * 8) + 2,
      actualHours: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : undefined
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
        return "bg-blue-500";
      case "in-progress":
        return "bg-purple-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "normal":
        return "bg-blue-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-purple-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-red-500";
      case "admin":
        return "bg-purple-500";
      case "manager":
        return "bg-blue-500";
      case "agent":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super-admin":
        return <Shield className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "manager":
        return <UserCheck className="h-4 w-4" />;
      case "agent":
        return <Users className="h-4 w-4" />;
      default:
        return <UserCheck className="h-4 w-4" />;
    }
  };

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      <SEO page="adminDashboard" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                <Shield className="inline mr-2 h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-white hover:text-blue-300 hover:bg-white/10 px-2 sm:px-4 py-2 rounded-xl transition-all duration-300 text-sm sm:text-base"
              >
                <Home className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:text-red-300 hover:bg-white/10 px-2 sm:px-4 py-2 rounded-xl transition-all duration-300 text-sm sm:text-base"
              >
                <LogOut className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome, Administrator!
          </h2>
          <p className="text-gray-300">
            Manage bookings, users, and system operations from here
          </p>
        </div>

                 {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-300 text-sm">Total Bookings</p>
                   <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
                 </div>
                 <Calendar className="h-8 w-8 text-blue-400" />
               </div>
             </CardContent>
           </Card>

           <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-300 text-sm">Pending Bookings</p>
                   <p className="text-2xl font-bold text-white">{stats.pendingBookings}</p>
                 </div>
                 <Clock className="h-8 w-8 text-yellow-400" />
               </div>
             </CardContent>
           </Card>

           <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-300 text-sm">Total Revenue</p>
                   <p className="text-2xl font-bold text-white">R{stats.totalRevenue}</p>
                 </div>
                 <DollarSign className="h-8 w-8 text-green-400" />
               </div>
             </CardContent>
           </Card>

           <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-300 text-sm">Active Users</p>
                   <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
                 </div>
                 <Users className="h-8 w-8 text-purple-400" />
               </div>
             </CardContent>
           </Card>

           <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-300 text-sm">Total Invoices</p>
                   <p className="text-2xl font-bold text-white">{stats.totalInvoices}</p>
                 </div>
                 <FileText className="h-8 w-8 text-indigo-400" />
               </div>
             </CardContent>
           </Card>

           <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-300 text-sm">Paid Invoices</p>
                   <p className="text-2xl font-bold text-white">{stats.paidInvoices}</p>
                 </div>
                 <CheckCircle className="h-8 w-8 text-green-400" />
               </div>
             </CardContent>
           </Card>
         </div>

        {/* Main Content */}
                 <Tabs defaultValue="bookings" className="space-y-6">
           <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
             <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300">
               <Package className="mr-2 h-4 w-4" />
               Bookings
             </TabsTrigger>
             <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300">
               <Users className="mr-2 h-4 w-4" />
               Users
             </TabsTrigger>
             <TabsTrigger value="invoices" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300">
               <FileText className="mr-2 h-4 w-4" />
               Invoices
             </TabsTrigger>
             <TabsTrigger value="applications" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300">
               <UserCheck className="mr-2 h-4 w-4" />
               Agent Applications
             </TabsTrigger>
             <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300">
               <BarChart3 className="mr-2 h-4 w-4" />
               Analytics
             </TabsTrigger>
           </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white font-semibold flex items-center">
                      <Search className="mr-2 h-4 w-4" />
                      Search Bookings
                    </Label>
                    <Input
                      placeholder="Search by service, location, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white font-semibold flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      Status Filter
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Bookings</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <div className="text-white">
                      <p className="text-sm text-gray-300">Filtered Results</p>
                      <p className="text-2xl font-bold">{filteredBookings.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.length === 0 ? (
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No bookings found</h3>
                    <p className="text-gray-300">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filters" 
                        : "No bookings have been created yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredBookings.map((booking) => (
                  <Card 
                    key={booking.id} 
                    className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{booking.serviceType}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getUrgencyColor(booking.urgency)} text-white`}>
                            {booking.urgency}
                          </Badge>
                          <Badge className={`${getStatusColor(booking.status)} text-white`}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-gray-300">
                        Booking ID: {booking.id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Clock className="mr-2 h-4 w-4" />
                          {booking.time}
                        </div>
                        <div className="flex items-center text-gray-300">
                          <MapPin className="mr-2 h-4 w-4" />
                          {booking.location}
                        </div>
                        <div className="flex items-center text-gray-300">
                          <DollarSign className="mr-2 h-4 w-4" />
                          R{booking.estimatedCost}
                        </div>
                      </div>
                      <p className="text-white mb-4">{booking.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-300">
                        <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleBookingClick(booking)}
                            className="text-white hover:text-blue-300 hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={booking.status}
                            onValueChange={(value) => handleStatusUpdate(booking.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="text-white hover:text-red-300 hover:bg-white/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

                                 {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        User Management
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Manage user accounts, roles, and permissions
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setIsNewUserModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{user.name}</h4>
                            <p className="text-gray-300 text-sm">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`${getRoleColor(user.role)} text-white text-xs`}>
                                {user.role.replace('-', ' ').toUpperCase()}
                              </Badge>
                              <Badge className={`${getUserStatusColor(user.status)} text-white text-xs`}>
                                {user.status}
                              </Badge>
                              {user.provider && (
                                <Badge className="bg-orange-500 text-white text-xs">
                                  {user.provider}
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs mt-1">
                              Joined: {new Date(user.joinDate).toLocaleDateString()}
                              {user.lastLogin && (
                                <span className="ml-2">
                                  • Last login: {new Date(user.lastLogin).toLocaleDateString()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => {
                              const updatedUsers = users.map(u => 
                                u.id === user.id ? { ...u, role: value as any } : u
                              );
                              setUsers(updatedUsers);
                              toast.success(`Role updated for ${user.name}`);
                            }}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs bg-white/10 border-white/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="super-admin">Super Admin</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select
                            value={user.status}
                            onValueChange={(value) => {
                              const updatedUsers = users.map(u => 
                                u.id === user.id ? { ...u, status: value as any } : u
                              );
                              setUsers(updatedUsers);
                              toast.success(`Status updated for ${user.name}`);
                            }}
                          >
                            <SelectTrigger className="w-24 h-8 text-xs bg-white/10 border-white/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-blue-300 hover:bg-white/10"
                            title="Send Email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          {user.phone && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:text-blue-300 hover:bg-white/10"
                              title="Call"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                                                     <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => handleUserClick(user)}
                             className="text-white hover:text-blue-300 hover:bg-white/10"
                             title="View Profile"
                           >
                             <Eye className="h-4 w-4" />
                           </Button>
                           <Button
                             variant="ghost"
                             size="sm"
                             className="text-white hover:text-yellow-300 hover:bg-white/10"
                             title="Edit User"
                           >
                             <Edit className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

           {/* Invoices Tab */}
           <TabsContent value="invoices" className="space-y-6">
             <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
               <CardHeader>
                 <CardTitle className="text-white flex items-center">
                   <FileText className="mr-2 h-5 w-5" />
                   Invoice Management
                 </CardTitle>
                 <CardDescription className="text-gray-300">
                   View and manage all invoices and payment statuses
                 </CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {invoices.length === 0 ? (
                     <div className="text-center py-8">
                       <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                       <h3 className="text-xl font-semibold text-white mb-2">No invoices found</h3>
                       <p className="text-gray-300">No invoices have been generated yet.</p>
                     </div>
                   ) : (
                     invoices.map((invoice) => (
                       <div key={invoice.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                                    <div className="flex items-center space-x-4">
                             <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                               <Receipt className="h-5 w-5 text-white" />
                             </div>
                             <div>
                               <h4 className="text-white font-semibold">Invoice #{invoice.id}</h4>
                               <p className="text-gray-300 text-sm">{invoice.customerName}</p>
                               <p className="text-gray-400 text-xs">
                                 Created: {new Date(invoice.createdAt).toLocaleDateString()}
                               </p>
                             </div>
                           </div>
                           <div className="flex items-center space-x-4">
                             <div className="text-right">
                               <p className="text-white font-semibold">R{invoice.amount}</p>
                               <Select
                                 value={invoice.status}
                                 onValueChange={(value) => handleInvoiceStatusUpdate(invoice.id, value)}
                               >
                                 <SelectTrigger className="w-32 h-8 text-xs bg-white/10 border-white/20">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="pending">Pending</SelectItem>
                                   <SelectItem value="paid">Paid</SelectItem>
                                   <SelectItem value="overdue">Overdue</SelectItem>
                                   <SelectItem value="cancelled">Cancelled</SelectItem>
                                 </SelectContent>
                               </Select>
                             </div>
                             <div className="flex items-center space-x-2">
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="text-white hover:text-blue-300 hover:bg-white/10"
                                 title="View Details"
                               >
                                 <Eye className="h-4 w-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="text-white hover:text-green-300 hover:bg-white/10"
                                 title="Download PDF"
                               >
                                 <Download className="h-4 w-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="text-white hover:text-purple-300 hover:bg-white/10"
                                 title="Print Invoice"
                               >
                                 <Printer className="h-4 w-4" />
                               </Button>
                             </div>
                           </div>
                       </div>
                     ))
                   )}
                 </div>
               </CardContent>
             </Card>
           </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Booking Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Bookings</span>
                      <span className="text-white font-bold">{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Pending</span>
                      <span className="text-yellow-400 font-bold">{stats.pendingBookings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Completed</span>
                      <span className="text-green-400 font-bold">{stats.completedBookings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Today's Bookings</span>
                      <span className="text-blue-400 font-bold">{stats.todayBookings}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Revenue</span>
                      <span className="text-white font-bold">R{stats.totalRevenue}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Average per Booking</span>
                      <span className="text-green-400 font-bold">
                        R{stats.totalBookings > 0 ? Math.round(stats.totalRevenue / stats.totalBookings) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Active Users</span>
                      <span className="text-purple-400 font-bold">{stats.activeUsers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Details Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-bold flex items-center">
              {getStatusIcon(selectedBooking?.status || "")}
              <span className="ml-2">Booking Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Header with Status and Urgency */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedBooking.serviceType}</h3>
                  <p className="text-gray-300">Booking ID: {selectedBooking.id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${getUrgencyColor(selectedBooking.urgency)} text-white`}>
                    {selectedBooking.urgency}
                  </Badge>
                  <Badge className={`${getStatusColor(selectedBooking.status)} text-white`}>
                    {selectedBooking.status}
                  </Badge>
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Service Date</p>
                      <p className="text-white font-semibold">{new Date(selectedBooking.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Service Time</p>
                      <p className="text-white font-semibold">{selectedBooking.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Service Location</p>
                      <p className="text-white font-semibold">{selectedBooking.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Estimated Cost</p>
                      <p className="text-white font-semibold">R{selectedBooking.estimatedCost}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Booked On</p>
                      <p className="text-white font-semibold">{new Date(selectedBooking.createdAt).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  
                  {selectedBooking.specificService && (
                    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                      <Info className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-gray-300 text-sm">Specific Service</p>
                        <p className="text-white font-semibold capitalize">
                          {selectedBooking.specificService.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Description */}
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-white font-semibold mb-2">Service Description</h4>
                <p className="text-gray-300 leading-relaxed">{selectedBooking.description}</p>
              </div>

              {/* Payment Information */}
              {selectedBooking.paymentStatus && (
                <div className="p-4 bg-white/5 rounded-xl">
                  <h4 className="text-white font-semibold mb-3">Payment Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">Status: {selectedBooking.paymentStatus}</span>
                    </div>
                    {selectedBooking.paymentMethod && (
                      <div className="flex items-center space-x-3">
                        <Receipt className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-300">Method: {selectedBooking.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button
                  onClick={() => setIsBookingModalOpen(false)}
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  Close
                </Button>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(value) => {
                    handleStatusUpdate(selectedBooking.id, value);
                    setIsBookingModalOpen(false);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Mark Pending</SelectItem>
                    <SelectItem value="confirmed">Mark Confirmed</SelectItem>
                    <SelectItem value="in-progress">Mark In Progress</SelectItem>
                    <SelectItem value="completed">Mark Completed</SelectItem>
                    <SelectItem value="cancelled">Mark Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
                 </DialogContent>
       </Dialog>

       {/* User Profile Modal */}
       <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
         <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="text-white text-2xl font-bold flex items-center">
               <Users className="mr-2 h-6 w-6 text-blue-400" />
               <span className="ml-2">User Profile</span>
             </DialogTitle>
           </DialogHeader>
           
           {selectedUser && (
             <div className="space-y-6">
               {/* User Header */}
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                 <div className="flex items-center space-x-4">
                   <div>
                     <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                     <p className="text-gray-300">{selectedUser.email}</p>
                     <div className="flex items-center space-x-2 mt-1">
                       <Badge className={`${getRoleColor(selectedUser.role)} text-white text-xs`}>
                         {selectedUser.role.replace('-', ' ').toUpperCase()}
                       </Badge>
                       <Badge className={`${getUserStatusColor(selectedUser.status)} text-white text-xs`}>
                         {selectedUser.status}
                       </Badge>
                       {selectedUser.provider && (
                         <Badge className="bg-orange-500 text-white text-xs">
                           {selectedUser.provider}
                         </Badge>
                       )}
                     </div>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-gray-300 text-sm">Member since</p>
                   <p className="text-white font-semibold">{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
                   {selectedUser.lastLogin && (
                     <>
                       <p className="text-gray-300 text-sm mt-2">Last login</p>
                       <p className="text-white font-semibold">{new Date(selectedUser.lastLogin).toLocaleDateString()}</p>
                     </>
                   )}
                 </div>
               </div>

               {/* Contact Information */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-white/5 rounded-xl">
                   <h4 className="text-white font-semibold mb-3 flex items-center">
                     <Mail className="mr-2 h-4 w-4 text-blue-400" />
                     Contact Information
                   </h4>
                   <div className="space-y-2">
                     <div className="flex items-center space-x-2">
                       <Mail className="h-4 w-4 text-gray-400" />
                       <span className="text-gray-300">{selectedUser.email}</span>
                     </div>
                     {selectedUser.phone && (
                       <div className="flex items-center space-x-2">
                         <Phone className="h-4 w-4 text-gray-400" />
                         <span className="text-gray-300">{selectedUser.phone}</span>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Manager Information */}
                 <div className="p-4 bg-white/5 rounded-xl">
                   <h4 className="text-white font-semibold mb-3 flex items-center">
                     <UserCheck className="mr-2 h-4 w-4 text-purple-400" />
                     Manager
                   </h4>
                   {(() => {
                     const manager = getManager(selectedUser.id);
                     return manager ? (
                       <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                           {getRoleIcon(manager.role)}
                         </div>
                         <div>
                           <p className="text-white font-semibold">{manager.name}</p>
                           <p className="text-gray-300 text-sm">{manager.email}</p>
                           <Badge className={`${getRoleColor(manager.role)} text-white text-xs mt-1`}>
                             {manager.role.replace('-', ' ').toUpperCase()}
                           </Badge>
                         </div>
                       </div>
                     ) : (
                       <p className="text-gray-400 italic">No manager assigned</p>
                     );
                   })()}
                 </div>
               </div>

               {/* Team Members (People Reporting) */}
               <div className="p-4 bg-white/5 rounded-xl">
                 <h4 className="text-white font-semibold mb-3 flex items-center">
                   <Users className="mr-2 h-4 w-4 text-green-400" />
                   Team Members ({getUsersReportingTo(selectedUser.id).length})
                 </h4>
                 {(() => {
                   const teamMembers = getUsersReportingTo(selectedUser.id);
                   return teamMembers.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                       {teamMembers.map((member) => (
                         <div key={member.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                           <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                             {getRoleIcon(member.role)}
                           </div>
                           <div className="flex-1 min-w-0">
                             <p className="text-white font-semibold text-sm truncate">{member.name}</p>
                             <p className="text-gray-300 text-xs truncate">{member.email}</p>
                             <Badge className={`${getRoleColor(member.role)} text-white text-xs mt-1`}>
                               {member.role.replace('-', ' ').toUpperCase()}
                             </Badge>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-gray-400 italic">No team members reporting</p>
                   );
                 })()}
               </div>

               {/* Tasks Section */}
               <div className="space-y-4">
                 <h4 className="text-white font-semibold text-lg flex items-center">
                   <Package className="mr-2 h-5 w-5 text-yellow-400" />
                   Tasks & Performance
                 </h4>
                 
                 {(() => {
                   const tasks = getTasksForUser(selectedUser.id);
                   const completedTasks = tasks.filter(task => task.status === 'completed');
                   const inProgressTasks = tasks.filter(task => task.status === 'in-progress');
                   const pendingTasks = tasks.filter(task => task.status === 'pending');
                   
                   return (
                     <div className="space-y-4">
                       {/* Task Statistics */}
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                           <div className="flex items-center justify-between">
                             <div>
                               <p className="text-green-400 text-sm">Completed</p>
                               <p className="text-white font-bold text-2xl">{completedTasks.length}</p>
                             </div>
                             <CheckCircle className="h-8 w-8 text-green-400" />
                           </div>
                         </div>
                         
                         <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                           <div className="flex items-center justify-between">
                             <div>
                               <p className="text-blue-400 text-sm">In Progress</p>
                               <p className="text-white font-bold text-2xl">{inProgressTasks.length}</p>
                             </div>
                             <Clock className="h-8 w-8 text-blue-400" />
                           </div>
                         </div>
                         
                         <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                           <div className="flex items-center justify-between">
                             <div>
                               <p className="text-yellow-400 text-sm">Pending</p>
                               <p className="text-white font-bold text-2xl">{pendingTasks.length}</p>
                             </div>
                             <AlertCircle className="h-8 w-8 text-yellow-400" />
                           </div>
                         </div>
                       </div>

                       {/* Task List */}
                       <div className="space-y-3">
                         <h5 className="text-white font-semibold">Recent Tasks</h5>
                         {tasks.slice(0, 5).map((task) => (
                           <div 
                             key={task.id} 
                             className="flex items-center justify-between p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-300"
                             onClick={() => handleTaskClick(task)}
                           >
                             <div className="flex-1">
                               <div className="flex items-center space-x-2">
                                 <h6 className="text-white font-semibold">{task.title}</h6>
                                 <Badge className={`${
                                   task.priority === 'high' ? 'bg-red-500' :
                                   task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                 } text-white text-xs`}>
                                   {task.priority}
                                 </Badge>
                                 <Badge className={`${
                                   task.status === 'completed' ? 'bg-green-500' :
                                   task.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                                 } text-white text-xs`}>
                                   {task.status}
                                 </Badge>
                               </div>
                               <p className="text-gray-300 text-sm mt-1">{task.description}</p>
                               <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                 <span>Assigned: {new Date(task.assignedDate).toLocaleDateString()}</span>
                                 <span>Est. Hours: {task.estimatedHours}h</span>
                                 {task.actualHours && <span>Actual: {task.actualHours}h</span>}
                                 {task.completedDate && <span>Completed: {new Date(task.completedDate).toLocaleDateString()}</span>}
                               </div>
                             </div>
                             <div className="ml-4">
                               <Eye className="h-4 w-4 text-gray-400 hover:text-blue-400 transition-colors" />
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   );
                 })()}
               </div>

               {/* Action Buttons */}
               <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                 <Button
                   onClick={() => setIsUserModalOpen(false)}
                   variant="outline"
                   className="border-2 border-gray-300 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                 >
                   Close
                 </Button>
                 <Button
                   variant="outline"
                   className="border-2 border-blue-300 text-blue-300 hover:bg-blue-500/10 hover:text-white transition-all duration-300"
                 >
                   <Mail className="mr-2 h-4 w-4" />
                   Send Message
                 </Button>
                 <Button
                   className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                 >
                   <Edit className="mr-2 h-4 w-4" />
                   Edit Profile
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* Task Details Modal */}
       <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
         <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl max-w-2xl">
           <DialogHeader>
             <DialogTitle className="text-white text-2xl font-bold flex items-center">
               <Package className="mr-2 h-6 w-6 text-yellow-400" />
               <span className="ml-2">Task Details</span>
             </DialogTitle>
           </DialogHeader>
           
           {selectedTask && (
             <div className="space-y-6">
               {/* Task Header */}
               <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                 <div className="flex-1">
                   <h3 className="text-xl font-bold text-white mb-2">{selectedTask.title}</h3>
                   <div className="flex items-center space-x-2">
                     <Badge className={`${
                       selectedTask.priority === 'high' ? 'bg-red-500' :
                       selectedTask.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                     } text-white text-xs`}>
                       {selectedTask.priority.toUpperCase()}
                     </Badge>
                     <Badge className={`${
                       selectedTask.status === 'completed' ? 'bg-green-500' :
                       selectedTask.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                     } text-white text-xs`}>
                       {selectedTask.status.replace('-', ' ').toUpperCase()}
                     </Badge>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="text-gray-300 text-sm">Task ID</p>
                   <p className="text-white font-semibold">{selectedTask.id}</p>
                 </div>
               </div>

               {/* Task Description */}
               <div className="p-4 bg-white/5 rounded-xl">
                 <h4 className="text-white font-semibold mb-3 flex items-center">
                   <FileText className="mr-2 h-4 w-4 text-blue-400" />
                   Description
                 </h4>
                 <p className="text-gray-300 leading-relaxed">{selectedTask.description}</p>
               </div>

               {/* Task Timeline */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 bg-white/5 rounded-xl">
                   <h4 className="text-white font-semibold mb-3 flex items-center">
                     <Calendar className="mr-2 h-4 w-4 text-green-400" />
                     Timeline
                   </h4>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center">
                       <span className="text-gray-300 text-sm">Assigned Date:</span>
                       <span className="text-white font-semibold">{new Date(selectedTask.assignedDate).toLocaleDateString()}</span>
                     </div>
                     {selectedTask.completedDate && (
                       <div className="flex justify-between items-center">
                         <span className="text-gray-300 text-sm">Completed Date:</span>
                         <span className="text-white font-semibold">{new Date(selectedTask.completedDate).toLocaleDateString()}</span>
                       </div>
                     )}
                     <div className="flex justify-between items-center">
                       <span className="text-gray-300 text-sm">Estimated Hours:</span>
                       <span className="text-white font-semibold">{selectedTask.estimatedHours}h</span>
                     </div>
                     {selectedTask.actualHours && (
                       <div className="flex justify-between items-center">
                         <span className="text-gray-300 text-sm">Actual Hours:</span>
                         <span className="text-white font-semibold">{selectedTask.actualHours}h</span>
                       </div>
                     )}
                   </div>
                 </div>

                 {/* Task Progress */}
                 <div className="p-4 bg-white/5 rounded-xl">
                   <h4 className="text-white font-semibold mb-3 flex items-center">
                     <TrendingUp className="mr-2 h-4 w-4 text-purple-400" />
                     Progress
                   </h4>
                   <div className="space-y-3">
                     <div className="flex justify-between items-center">
                       <span className="text-gray-300 text-sm">Status:</span>
                       <Badge className={`${
                         selectedTask.status === 'completed' ? 'bg-green-500' :
                         selectedTask.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                       } text-white text-xs`}>
                         {selectedTask.status.replace('-', ' ').toUpperCase()}
                       </Badge>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-gray-300 text-sm">Priority:</span>
                       <Badge className={`${
                         selectedTask.priority === 'high' ? 'bg-red-500' :
                         selectedTask.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                       } text-white text-xs`}>
                         {selectedTask.priority.toUpperCase()}
                       </Badge>
                     </div>
                     {selectedTask.actualHours && selectedTask.estimatedHours && (
                       <div className="flex justify-between items-center">
                         <span className="text-gray-300 text-sm">Efficiency:</span>
                         <span className={`font-semibold ${
                           selectedTask.actualHours <= selectedTask.estimatedHours ? 'text-green-400' : 'text-red-400'
                         }`}>
                           {selectedTask.actualHours <= selectedTask.estimatedHours ? 'On Time' : 'Over Time'}
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                 <Button
                   onClick={() => setIsTaskModalOpen(false)}
                   variant="outline"
                   className="border-2 border-gray-300 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                 >
                   Close
                 </Button>
                 <Button
                   variant="outline"
                   className="border-2 border-blue-300 text-blue-300 hover:bg-blue-500/10 hover:text-white transition-all duration-300"
                 >
                   <Edit className="mr-2 h-4 w-4" />
                   Edit Task
                 </Button>
                 <Button
                   className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
                 >
                   <CheckCircle className="mr-2 h-4 w-4" />
                   Mark Complete
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>

       {/* Add User Modal */}
       <Dialog open={isNewUserModalOpen} onOpenChange={setIsNewUserModalOpen}>
         <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl max-w-md">
           <DialogHeader>
             <DialogTitle className="text-white text-2xl font-bold flex items-center">
               <UserPlus className="mr-2 h-6 w-6 text-blue-400" />
               <span className="ml-2">Add New User</span>
             </DialogTitle>
           </DialogHeader>
           
           <div className="space-y-6">
             {/* User Information Form */}
             <div className="space-y-4">
               <div className="space-y-2">
                 <Label className="text-white font-semibold">Full Name *</Label>
                 <Input
                   placeholder="Enter full name"
                   value={newUser.name}
                   onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                   className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                 />
               </div>
               
               <div className="space-y-2">
                 <Label className="text-white font-semibold">Email Address *</Label>
                 <Input
                   type="email"
                   placeholder="Enter email address"
                   value={newUser.email}
                   onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                   className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                 />
               </div>
               
               <div className="space-y-2">
                 <Label className="text-white font-semibold">Phone Number</Label>
                 <Input
                   type="tel"
                   placeholder="Enter phone number"
                   value={newUser.phone}
                   onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                   className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                 />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label className="text-white font-semibold">Role</Label>
                   <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as any })}>
                     <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="super-admin">Super Admin</SelectItem>
                       <SelectItem value="admin">Admin</SelectItem>
                       <SelectItem value="manager">Manager</SelectItem>
                       <SelectItem value="agent">Agent</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
                 
                 <div className="space-y-2">
                   <Label className="text-white font-semibold">Status</Label>
                   <Select value={newUser.status} onValueChange={(value) => setNewUser({ ...newUser, status: value as any })}>
                     <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="active">Active</SelectItem>
                       <SelectItem value="inactive">Inactive</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               </div>
             </div>

             {/* Action Buttons */}
             <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
               <Button
                 onClick={() => setIsNewUserModalOpen(false)}
                 variant="outline"
                 className="border-2 border-gray-300 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
               >
                 Cancel
               </Button>
               <Button
                 onClick={handleAddUser}
                 className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
               >
                 <UserPlus className="mr-2 h-4 w-4" />
                 Add User
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </div>
     </>
   );
 };

export default AdminDashboard;
