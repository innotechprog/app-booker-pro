import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Home
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
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
    toast.success("Successfully logged out");
    navigate("/");
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

  if (!user) {
    return <div>Loading...</div>;
  }

  const activeBookings = bookings.filter(b => ["pending", "confirmed", "in-progress"].includes(b.status));
  const completedBookings = bookings.filter(b => ["completed", "cancelled"].includes(b.status));

  return (
    <div className="min-h-screen bg-hero-gradient">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-card-foreground">
              IBIS<span className="text-primary">.</span> Dashboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-card-foreground hover:text-primary"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-card-foreground hover:text-primary"
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
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-muted-foreground">
            Manage your bookings and account from here
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold text-card-foreground">{bookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active</p>
                  <p className="text-2xl font-bold text-card-foreground">{activeBookings.length}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-2xl font-bold text-card-foreground">{completedBookings.length}</p>
                </div>
                <History className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <Button
                onClick={() => navigate("/")}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Booking
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-card border-border">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-6">
            {bookings.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground mb-6">Book your first service to get started</p>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Book a Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-card-foreground">{booking.serviceType}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getUrgencyColor(booking.urgency)} text-white`}>
                            {booking.urgency}
                          </Badge>
                          <Badge className={`${getStatusColor(booking.status)} text-white`}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-muted-foreground">
                        Booking ID: {booking.id}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {booking.time}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="mr-2 h-4 w-4" />
                          {booking.location}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <span className="mr-2">💰</span>
                          Estimated: ${booking.estimatedCost}
                        </div>
                      </div>
                      <p className="text-card-foreground mb-4">{booking.description}</p>
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-card-foreground">Full Name</Label>
                    <p className="text-muted-foreground mt-1">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-card-foreground">Email</Label>
                    <p className="text-muted-foreground mt-1">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-card-foreground">Phone</Label>
                    <p className="text-muted-foreground mt-1">{user.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-card-foreground">Member Since</Label>
                    <p className="text-muted-foreground mt-1">
                      {new Date(user.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;