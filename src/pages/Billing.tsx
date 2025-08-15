import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, DollarSign, CheckCircle, Calendar, Clock, MapPin, Receipt, Building, ExternalLink, Send } from "lucide-react";

interface BookingData {
  serviceType: string;
  date: string;
  time: string;
  location: string;
  description: string;
  urgency: string;
  contactMethod: string;
  specificService: string;
  customService: string;
}

const Billing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state?.bookingData as BookingData;
  
  const [billingData, setBillingData] = useState({
    billingAddress: "",
    city: "",
    postalCode: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("payfast");

  useEffect(() => {
    if (!bookingData) {
      toast.error("No booking data found");
      navigate("/booking");
      return;
    }

    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      toast.error("Please log in to complete billing");
      navigate("/login");
      return;
    }
  }, [bookingData, navigate]);

  const handleChange = (field: string, value: string) => {
    setBillingData({
      ...billingData,
      [field]: value,
    });
  };

  const handlePayfastRedirect = () => {
    setIsLoading(true);
    
    // Simulate redirect to Payfast
    setTimeout(() => {
      // In a real implementation, this would redirect to Payfast's payment gateway
      toast.success("Redirecting to PayFast...");
      // window.location.href = "https://www.payfast.co.za/eng/process";
      
      // For demo purposes, we'll just show a success message
      toast.success("Payment completed via PayFast!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 2000);
  };

  const handleSendInvoice = () => {
    setIsLoading(true);
    
    // Generate invoice and send
    setTimeout(() => {
      const invoiceNumber = `INV-${Date.now()}`;
      const invoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        serviceType: bookingData.serviceType,
        specificService: bookingData.specificService,
        amount: estimatedCost,
        paymentMethod: "bank-transfer",
        paymentStatus: "pending",
        paymentDate: new Date().toISOString(),
        billingAddress: `${billingData.billingAddress}, ${billingData.city}, ${billingData.postalCode}`,
        description: bookingData.description,
        date: bookingData.date,
        time: bookingData.time,
        location: bookingData.location,
        email: billingData.email
      };

      // Store invoice
      const existingInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
      existingInvoices.push(invoice);
      localStorage.setItem("invoices", JSON.stringify(existingInvoices));

      toast.success("Invoice sent successfully!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 2000);
  };

  if (!bookingData) {
    return <div>Loading...</div>;
  }

  const estimatedCost = Math.floor(Math.random() * 100) + 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/booking")}
            className="mb-6 text-white hover:text-blue-300 hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Booking
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Booking Summary */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                  Booking Summary
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Review your service details before payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Service Date</p>
                      <p className="text-white font-semibold">{new Date(bookingData.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Service Time</p>
                      <p className="text-white font-semibold">{bookingData.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Location</p>
                      <p className="text-white font-semibold">{bookingData.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Estimated Cost</p>
                      <p className="text-white font-semibold">R{estimatedCost}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Service Details</h4>
                  <p className="text-gray-300 text-sm mb-2">
                    <span className="font-medium">Type:</span> {bookingData.specificService === "other" ? bookingData.customService : bookingData.specificService.replace('-', ' ')}
                  </p>
                  <p className="text-gray-300 text-sm mb-2">
                    <span className="font-medium">Urgency:</span> {bookingData.urgency}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium">Contact:</span> {bookingData.contactMethod}
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="text-white font-semibold mb-2">Description</h4>
                  <p className="text-gray-300 text-sm">{bookingData.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Options */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-blue-400" />
                  Payment Options
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/20">
                    <TabsTrigger 
                      value="payfast" 
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
                    >
                      PayFast
                    </TabsTrigger>
                    <TabsTrigger 
                      value="bank-transfer" 
                      className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-gray-300"
                    >
                      Bank Transfer
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="payfast" className="mt-6">
                    <div className="space-y-6">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <ExternalLink className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-800 font-semibold">Secure Payment via PayFast</span>
                        </div>
                        <p className="text-blue-700 text-sm">
                          You will be redirected to PayFast's secure payment gateway to complete your transaction.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white font-semibold">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your-email@example.com"
                            value={billingData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                            required
                          />
                        </div>

                        <div className="p-4 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Total Amount:</span>
                            <span className="text-white font-bold text-xl">R{estimatedCost}</span>
                          </div>
                        </div>

                        <Button
                          onClick={handlePayfastRedirect}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          disabled={isLoading || !billingData.email}
                        >
                          {isLoading ? "Redirecting..." : `Proceed to PayFast - R${estimatedCost}`}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="bank-transfer" className="mt-6">
                    <div className="space-y-6">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Receipt className="h-4 w-4 text-green-600" />
                          <span className="text-green-800 font-semibold">Bank Transfer Invoice</span>
                        </div>
                        <p className="text-green-700 text-sm">
                          We'll generate an invoice with our bank details. Please include the invoice number as payment reference.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="billingAddress" className="text-white font-semibold">Billing Address</Label>
                          <Input
                            id="billingAddress"
                            type="text"
                            placeholder="Enter your billing address"
                            value={billingData.billingAddress}
                            onChange={(e) => handleChange("billingAddress", e.target.value)}
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-white font-semibold">City</Label>
                            <Input
                              id="city"
                              type="text"
                              placeholder="Enter city"
                              value={billingData.city}
                              onChange={(e) => handleChange("city", e.target.value)}
                              className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="postalCode" className="text-white font-semibold">Postal Code</Label>
                            <Input
                              id="postalCode"
                              type="text"
                              placeholder="Enter postal code"
                              value={billingData.postalCode}
                              onChange={(e) => handleChange("postalCode", e.target.value)}
                              className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white font-semibold">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your-email@example.com"
                            value={billingData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                            required
                          />
                        </div>

                        <div className="p-4 bg-white/5 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Total Amount:</span>
                            <span className="text-white font-bold text-xl">R{estimatedCost}</span>
                          </div>
                        </div>

                        <Button
                          onClick={handleSendInvoice}
                          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          disabled={isLoading || !billingData.email || !billingData.billingAddress || !billingData.city || !billingData.postalCode}
                        >
                          {isLoading ? "Sending Invoice..." : `Send Invoice - R${estimatedCost}`}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
