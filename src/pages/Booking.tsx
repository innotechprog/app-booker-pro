import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Clock, MapPin, Send } from "lucide-react";
import SEO from "@/components/SEO";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const serviceType = searchParams.get("service") || "Send Me";
  const navigate = useNavigate();
  
  const [bookingData, setBookingData] = useState({
    serviceType,
    date: "",
    time: "",
    location: "",
    description: "",
    urgency: "normal",
    contactMethod: "phone",
    specificService: "",
    customService: "",
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

    // Simulate form validation
    setTimeout(() => {
      // Navigate to billing form with booking data
      navigate("/billing", { state: { bookingData } });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      <SEO page="booking" />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Booking Form Section */}
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/book-service")}
            className="mb-6 text-white hover:text-blue-300 hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Send Me
          </Button>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">
                    Book Send Me Service
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Fill in the details below to book your Send Me service
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-white font-semibold">Preferred Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={bookingData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-white font-semibold">Preferred Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="time"
                        type="time"
                        value={bookingData.time}
                        onChange={(e) => handleChange("time", e.target.value)}
                        className="pl-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                                 <div className="space-y-2">
                   <Label htmlFor="location" className="text-white font-semibold">Service Location</Label>
                   <div className="relative">
                     <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                     <Input
                       id="location"
                       type="text"
                       placeholder="Enter service location"
                       value={bookingData.location}
                       onChange={(e) => handleChange("location", e.target.value)}
                       className="pl-10 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                       required
                     />
                   </div>
                 </div>

                                   <div className="space-y-2">
                    <Label htmlFor="specificService" className="text-white font-semibold">Specific Service</Label>
                    <Select value={bookingData.specificService} onValueChange={(value) => handleChange("specificService", value)}>
                      <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900">
                        <SelectValue placeholder="Select a specific service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grocery-shopping">Grocery Shopping</SelectItem>
                        <SelectItem value="prescription-pickup">Prescription Pickup</SelectItem>
                        <SelectItem value="dry-cleaning">Dry Cleaning Pickup/Drop-off</SelectItem>
                        <SelectItem value="package-delivery">Package Delivery</SelectItem>
                        <SelectItem value="document-delivery">Document Delivery</SelectItem>
                        <SelectItem value="meal-delivery">Meal/Food Delivery</SelectItem>
                        <SelectItem value="appointment-scheduling">Appointment Scheduling</SelectItem>
                        <SelectItem value="file-organization">File/Paperwork Organization</SelectItem>
                        <SelectItem value="travel-booking">Travel/Accommodation Booking</SelectItem>
                        <SelectItem value="light-cleaning">Light Cleaning/Tidying</SelectItem>
                        <SelectItem value="plant-pet-care">Plant Watering/Pet Feeding</SelectItem>
                        <SelectItem value="maintenance-appointments">Home Maintenance Appointments</SelectItem>
                        <SelectItem value="document-filing">Document Filing/Copying</SelectItem>
                        <SelectItem value="office-errands">Office-related Errands</SelectItem>
                        <SelectItem value="event-setup">Event Setup/Coordination</SelectItem>
                        <SelectItem value="supplies-pickup">Supplies/Decorations Pickup</SelectItem>
                        <SelectItem value="event-assistance">Event Assistance</SelectItem>
                        <SelectItem value="school-pickup">School Pickup/Drop-off</SelectItem>
                        <SelectItem value="babysitting">Babysitting/Supervision</SelectItem>
                        <SelectItem value="tech-setup">Technology Setup</SelectItem>
                        <SelectItem value="elderly-assistance">Elderly/Disabled Assistance</SelectItem>
                        <SelectItem value="emergency-delivery">Emergency Delivery</SelectItem>
                        <SelectItem value="other">Other (Please specify below)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {bookingData.specificService === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="customService" className="text-white font-semibold">Specify Your Service</Label>
                      <Input
                        id="customService"
                        type="text"
                        placeholder="Please describe the service you need..."
                        value={bookingData.customService}
                        onChange={(e) => handleChange("customService", e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                        required={bookingData.specificService === "other"}
                      />
                    </div>
                  )}

                <div className="space-y-2">
                  <Label htmlFor="urgency" className="text-white font-semibold">Urgency Level</Label>
                  <Select value={bookingData.urgency} onValueChange={(value) => handleChange("urgency", value)}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900">
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
                  <Label htmlFor="contactMethod" className="text-white font-semibold">Preferred Contact Method</Label>
                  <Select value={bookingData.contactMethod} onValueChange={(value) => handleChange("contactMethod", value)}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900">
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
                  <Label htmlFor="description" className="text-white font-semibold">Service Description</Label>
                                     <Textarea
                     id="description"
                     placeholder={bookingData.specificService === "other" 
                       ? "Please describe your custom service request in detail..." 
                       : "Describe what you need help with in detail..."}
                     value={bookingData.description}
                     onChange={(e) => handleChange("description", e.target.value)}
                     className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 min-h-[120px] resize-none"
                     required
                   />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? "Booking Service..." : "Book Send Me Service"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default Booking;
