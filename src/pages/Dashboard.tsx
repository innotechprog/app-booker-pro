import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  LogOut, 
  Plus, 
  History,
  Settings,
  Home,
  Save,
  X,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Info,
  Receipt
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
}

interface User {
  name: string;
  email: string;
  phone?: string;
  joinDate: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Load user data
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load bookings
    const bookingsData = localStorage.getItem("bookings");
    if (bookingsData) {
      setBookings(JSON.parse(bookingsData));
    } else {
      // Add a sample in-progress booking if no bookings exist
      const sampleBooking = {
        id: "sample-001",
        serviceType: "Send Me",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
        time: "14:00",
        location: "Sandton, Johannesburg",
        description: "Grocery shopping and prescription pickup from Sandton City Mall. Need fresh produce, dairy products, and prescription medication from the pharmacy.",
        status: "in-progress",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        estimatedCost: 85,
        urgency: "normal",
        specificService: "grocery-shopping"
      };
      setBookings([sampleBooking]);
      localStorage.setItem("bookings", JSON.stringify([sampleBooking]));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    toast.success("Successfully logged out");
    navigate("/");
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || ""
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: "",
      email: "",
      phone: ""
    });
  };

  const handleSaveProfile = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm({
      ...editForm,
      [field]: value
    });
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedBooking(null);
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
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const activeBookings = bookings.filter(b => ["pending", "confirmed", "in-progress"].includes(b.status));
  const completedBookings = bookings.filter(b => ["completed", "cancelled"].includes(b.status));
  
  const getFilteredBookings = () => {
    switch (activeTab) {
      case "all":
        return bookings;
      case "active":
        return activeBookings;
      case "completed":
        return completedBookings;
      default:
        return bookings;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-white">
              IBIS<span className="text-blue-400">.</span> Dashboard
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
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-300">
            Manage your bookings and account from here
          </p>
        </div>

                 {/* Quick Stats */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
           <Card 
             className={`bg-white/10 backdrop-blur-sm border-white/20 shadow-xl cursor-pointer hover:bg-white/15 transition-all duration-300 transform hover:scale-105 ${activeTab === "all" ? "ring-2 ring-blue-400" : ""}`}
             onClick={() => setActiveTab("all")}
           >
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-300 text-sm">Total Bookings</p>
                   <p className="text-2xl font-bold text-white">{bookings.length}</p>
                 </div>
                 <Calendar className="h-8 w-8 text-blue-400" />
               </div>
             </CardContent>
           </Card>

           <Card 
             className={`bg-white/10 backdrop-blur-sm border-white/20 shadow-xl cursor-pointer hover:bg-white/15 transition-all duration-300 transform hover:scale-105 ${activeTab === "active" ? "ring-2 ring-blue-400" : ""}`}
             onClick={() => setActiveTab("active")}
           >
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-300 text-sm">Active</p>
                   <p className="text-2xl font-bold text-white">{activeBookings.length}</p>
                 </div>
                 <Clock className="h-8 w-8 text-blue-400" />
               </div>
             </CardContent>
           </Card>

           <Card 
             className={`bg-white/10 backdrop-blur-sm border-white/20 shadow-xl cursor-pointer hover:bg-white/15 transition-all duration-300 transform hover:scale-105 ${activeTab === "completed" ? "ring-2 ring-blue-400" : ""}`}
             onClick={() => setActiveTab("completed")}
           >
             <CardContent className="p-6">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-gray-300 text-sm">Completed</p>
                   <p className="text-2xl font-bold text-white">{completedBookings.length}</p>
                 </div>
                 <History className="h-8 w-8 text-blue-400" />
               </div>
             </CardContent>
           </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-6">
                             <Button
                 onClick={() => navigate("/booking")}
                 className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
               >
                 <Plus className="mr-2 h-4 w-4" />
                 New Booking
               </Button>
            </CardContent>
          </Card>
        </div>

                 {/* Main Content */}
         <Tabs defaultValue="bookings" className="space-y-6">
           <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
             <TabsTrigger value="bookings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300">
               My Bookings
             </TabsTrigger>
             <TabsTrigger value="invoices" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300">
               Invoices
             </TabsTrigger>
             <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300">
               Profile
             </TabsTrigger>
           </TabsList>

                     <TabsContent value="bookings" className="space-y-6">
             {getFilteredBookings().length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                     <h3 className="text-xl font-semibold text-white mb-2">
                     {activeTab === "all" ? "No bookings yet" : 
                      activeTab === "active" ? "No active bookings" : 
                      "No completed bookings"}
                   </h3>
                   <p className="text-gray-300 mb-6">
                     {activeTab === "all" ? "Book your first service to get started" : 
                      activeTab === "active" ? "You don't have any active bookings at the moment" : 
                      "You don't have any completed bookings yet"}
                   </p>
                                     <Button
                     onClick={() => navigate("/booking")}
                     className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                   >
                     <Plus className="mr-2 h-4 w-4" />
                     Book a Service
                   </Button>
                </CardContent>
              </Card>
                         ) : (
               <div className="grid gap-6">
                 {getFilteredBookings().map((booking) => (
                   <Card 
                     key={booking.id} 
                     className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl cursor-pointer hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02]"
                     onClick={() => handleBookingClick(booking)}
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
                          <span className="mr-2">💰</span>
                          Estimated: ${booking.estimatedCost}
                        </div>
                      </div>
                      <p className="text-white mb-4">{booking.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-300">
                        <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
                     </TabsContent>

           <TabsContent value="invoices" className="space-y-6">
             <div className="flex items-center justify-between">
               <div>
                 <h3 className="text-xl font-semibold text-white mb-2">Payment History</h3>
                 <p className="text-gray-300">View and manage your invoices</p>
               </div>
               <Button
                 onClick={() => navigate("/invoices")}
                 className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
               >
                 <Receipt className="mr-2 h-4 w-4" />
                 View All Invoices
               </Button>
             </div>
             
             <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
               <CardContent className="p-12 text-center">
                 <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                 <h3 className="text-xl font-semibold text-white mb-2">Invoice Management</h3>
                 <p className="text-gray-300 mb-6">Access your complete payment history and download invoices</p>
                 <Button
                   onClick={() => navigate("/invoices")}
                   className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                 >
                   <Receipt className="mr-2 h-4 w-4" />
                   Go to Invoices
                 </Button>
               </CardContent>
             </Card>
           </TabsContent>

           <TabsContent value="profile">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Manage your account details
                </CardDescription>
              </CardHeader>
                             <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <Label className="text-white font-semibold">Full Name</Label>
                     {isEditing ? (
                       <Input
                         value={editForm.name}
                         onChange={(e) => handleInputChange("name", e.target.value)}
                         className="mt-1 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                         placeholder="Enter your full name"
                       />
                     ) : (
                       <p className="text-gray-300 mt-1">{user.name}</p>
                     )}
                   </div>
                   <div>
                     <Label className="text-white font-semibold">Email</Label>
                     {isEditing ? (
                       <Input
                         type="email"
                         value={editForm.email}
                         onChange={(e) => handleInputChange("email", e.target.value)}
                         className="mt-1 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                         placeholder="Enter your email"
                       />
                     ) : (
                       <p className="text-gray-300 mt-1">{user.email}</p>
                     )}
                   </div>
                   <div>
                     <Label className="text-white font-semibold">Phone</Label>
                     {isEditing ? (
                       <Input
                         type="tel"
                         value={editForm.phone}
                         onChange={(e) => handleInputChange("phone", e.target.value)}
                         className="mt-1 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                         placeholder="Enter your phone number"
                       />
                     ) : (
                       <p className="text-gray-300 mt-1">{user.phone || "Not provided"}</p>
                     )}
                   </div>
                   <div>
                     <Label className="text-white font-semibold">Member Since</Label>
                     <p className="text-gray-300 mt-1">
                       {new Date(user.joinDate).toLocaleDateString()}
                     </p>
                   </div>
                 </div>
                 
                 {isEditing ? (
                   <div className="flex space-x-3 mt-6">
                     <Button 
                       onClick={handleSaveProfile}
                       className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                     >
                       <Save className="mr-2 h-4 w-4" />
                       Save Changes
                     </Button>
                     <Button 
                       onClick={handleCancelEdit}
                       variant="outline"
                       className="border-2 border-gray-300 text-gray-300 hover:bg-white/10 hover:text-white py-3 font-semibold rounded-xl transition-all duration-300"
                     >
                       <X className="mr-2 h-4 w-4" />
                       Cancel
                     </Button>
                   </div>
                 ) : (
                   <Button 
                     onClick={handleEditClick}
                     className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                   >
                     <Settings className="mr-2 h-4 w-4" />
                     Edit Profile
                   </Button>
                 )}
               </CardContent>
            </Card>
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
                       <p className="text-white font-semibold">${selectedBooking.estimatedCost}</p>
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

               {/* Contact Information */}
               <div className="p-4 bg-white/5 rounded-xl">
                 <h4 className="text-white font-semibold mb-3">Contact Information</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="flex items-center space-x-3">
                     <Mail className="h-4 w-4 text-blue-400" />
                     <span className="text-gray-300">{user.email}</span>
                   </div>
                   <div className="flex items-center space-x-3">
                     <Phone className="h-4 w-4 text-blue-400" />
                     <span className="text-gray-300">{user.phone || "Not provided"}</span>
                   </div>
                 </div>
               </div>

               {/* Action Buttons */}
               <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                 <Button
                   onClick={closeBookingModal}
                   variant="outline"
                   className="border-2 border-gray-300 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                 >
                   Close
                 </Button>
                 <Button
                   onClick={() => {
                     // Add any additional actions here
                     toast.info("Feature coming soon!");
                   }}
                   className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300"
                 >
                   Contact Support
                 </Button>
               </div>
             </div>
           )}
         </DialogContent>
       </Dialog>
     </div>
   );
 };

export default Dashboard;