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
  Mail
} from "lucide-react";

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
}

interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  activeUsers: number;
  todayBookings: number;
}

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    todayBookings: 0
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
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
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+27 987 654 321",
        joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        provider: "google"
      },
      ...bookingsData.map((booking: Booking, index: number) => ({
        id: `user-${index + 3}`,
        name: booking.userEmail?.split("@")[0] || `User ${index + 3}`,
        email: booking.userEmail || `user${index + 3}@example.com`,
        phone: booking.userPhone || `+27 ${Math.floor(Math.random() * 900000000) + 100000000}`,
        joinDate: booking.createdAt,
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

    setStats({
      totalBookings: bookingsData.length,
      pendingBookings,
      completedBookings,
      totalRevenue,
      activeUsers: usersData.length,
      todayBookings
    });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">
              <Shield className="inline mr-2 h-6 w-6 text-blue-400" />
              Admin Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-white hover:text-blue-300 hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-white hover:text-red-300 hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
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
                  <p className="text-gray-300 text-sm">Today's Bookings</p>
                  <p className="text-2xl font-bold text-white">{stats.todayBookings}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">Completed</p>
                  <p className="text-2xl font-bold text-white">{stats.completedBookings}</p>
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
                <CardTitle className="text-white flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Registered Users
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Manage user accounts and view user information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{user.name}</h4>
                          <p className="text-gray-300 text-sm">{user.email}</p>
                          <p className="text-gray-400 text-xs">
                            Joined: {new Date(user.joinDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.provider && (
                          <Badge className="bg-green-500 text-white">
                            {user.provider}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:text-blue-300 hover:bg-white/10"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        {user.phone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-blue-300 hover:bg-white/10"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
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
    </div>
  );
};

export default AdminDashboard;
