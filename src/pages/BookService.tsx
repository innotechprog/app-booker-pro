import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";

const BookService = () => {
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("service") || "Errand Running";
  const navigate = useNavigate();
  
  const [bookingData, setBookingData] = useState({
    serviceType,
    date: "",
    time: "",
    location: "",
    description: "",
    urgency: "normal",
    contactMethod: "phone",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setBookingData({
      ...bookingData,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      toast.error("Please log in to book a service");
      navigate(`/login`);
      return;
    }

    setIsLoading(true);

    // Simulate booking process
    setTimeout(() => {
      const booking = {
        id: Date.now().toString(),
        ...bookingData,
        status: "pending",
        createdAt: new Date().toISOString(),
        estimatedCost: Math.floor(Math.random() * 100) + 50, // Random cost for demo
      };

      // Get existing bookings
      const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      existingBookings.push(booking);
      localStorage.setItem("bookings", JSON.stringify(existingBookings));

      toast.success("Service booked successfully!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-hero-gradient px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Book {serviceType}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Fill in the details below to book your service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-card-foreground">Preferred Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      className="pl-10 bg-background border-border text-foreground"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time" className="text-card-foreground">Preferred Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={bookingData.time}
                      onChange={(e) => handleChange("time", e.target.value)}
                      className="pl-10 bg-background border-border text-foreground"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-card-foreground">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter service location"
                    value={bookingData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="pl-10 bg-background border-border text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="urgency" className="text-card-foreground">Urgency Level</Label>
                <Select value={bookingData.urgency} onValueChange={(value) => handleChange("urgency", value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Within a week</SelectItem>
                    <SelectItem value="normal">Normal - Within 2-3 days</SelectItem>
                    <SelectItem value="high">High - Within 24 hours</SelectItem>
                    <SelectItem value="urgent">Urgent - Same day</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactMethod" className="text-card-foreground">Preferred Contact Method</Label>
                <Select value={bookingData.contactMethod} onValueChange={(value) => handleChange("contactMethod", value)}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-card-foreground">Service Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you need help with in detail..."
                  value={bookingData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="bg-background border-border text-foreground min-h-[120px]"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? "Booking Service..." : "Book Service"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookService;