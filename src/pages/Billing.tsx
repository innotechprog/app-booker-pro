import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, DollarSign, CheckCircle, Calendar, Clock, MapPin, Receipt, Building } from "lucide-react";

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
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
    billingAddress: "",
    city: "",
    postalCode: "",
    paymentMethod: "credit-card",
    bankAccount: "",
    accountHolder: "",
    bankName: "",
    payfastEmail: ""
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      const booking = {
        id: Date.now().toString(),
        ...bookingData,
        status: billingData.paymentMethod === "bank-transfer" ? "pending" : "confirmed",
        createdAt: new Date().toISOString(),
        estimatedCost: Math.floor(Math.random() * 100) + 50,
        paymentStatus: billingData.paymentMethod === "bank-transfer" ? "pending" : "paid",
        paymentMethod: billingData.paymentMethod,
        billingAddress: `${billingData.billingAddress}, ${billingData.city}, ${billingData.postalCode}`,
        bankDetails: billingData.paymentMethod === "bank-transfer" ? {
          bankAccount: billingData.bankAccount,
          accountHolder: billingData.accountHolder,
          bankName: billingData.bankName
        } : null,
        payfastEmail: billingData.paymentMethod === "payfast" ? billingData.payfastEmail : null
      };

      // Get existing bookings
      const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
      existingBookings.push(booking);
      localStorage.setItem("bookings", JSON.stringify(existingBookings));

      if (billingData.paymentMethod === "bank-transfer") {
        toast.success("Invoice generated! Please complete the bank transfer to confirm your booking.");
        // Generate and show invoice
        generateInvoice(booking);
      } else {
        toast.success("Payment successful! Your booking has been confirmed.");
      }
      
      navigate("/dashboard");
      setIsLoading(false);
    }, 2000);
  };

  const generateInvoice = (booking: any) => {
    const invoiceNumber = `INV-${Date.now()}`;
    const invoice = {
      id: `inv-${Date.now()}`,
      bookingId: booking.id,
      invoiceNumber,
      serviceType: booking.serviceType,
      specificService: booking.specificService,
      amount: booking.estimatedCost,
      paymentMethod: "bank-transfer",
      paymentStatus: "pending",
      paymentDate: booking.createdAt,
      billingAddress: booking.billingAddress,
      description: booking.description,
      date: booking.date,
      time: booking.time,
      location: booking.location,
      bankDetails: booking.bankDetails
    };

    // Store invoice
    const existingInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    existingInvoices.push(invoice);
    localStorage.setItem("invoices", JSON.stringify(existingInvoices));

    // Show invoice details
    const invoiceDetails = `
INVOICE ${invoiceNumber}

Service Details:
- Service: ${booking.specificService === "other" ? booking.customService : booking.specificService.replace('-', ' ')}
- Date: ${new Date(booking.date).toLocaleDateString()}
- Time: ${booking.time}
- Location: ${booking.location}
- Amount: R${booking.estimatedCost}

Bank Transfer Details:
- Bank: ${booking.bankDetails.bankName}
- Account Number: ${booking.bankDetails.bankAccount}
- Account Holder: ${booking.bankDetails.accountHolder}
- Reference: ${invoiceNumber}

Please include the invoice number as payment reference.
    `;

    // In a real app, this would generate a PDF
    console.log("Invoice generated:", invoiceDetails);
    toast.info("Invoice details logged to console. In production, this would generate a downloadable PDF.");
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
                      <p className="text-white font-semibold">${estimatedCost}</p>
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

            {/* Billing Form */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-blue-400" />
                  Payment Information
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Complete your payment to confirm the booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod" className="text-white font-semibold">Payment Method</Label>
                    <Select value={billingData.paymentMethod} onValueChange={(value) => handleChange("paymentMethod", value)}>
                      <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit-card">Credit/Debit Card</SelectItem>
                        <SelectItem value="payfast">PayFast</SelectItem>
                        <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {billingData.paymentMethod === "credit-card" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber" className="text-white font-semibold">Card Number</Label>
                        <Input
                          id="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={billingData.cardNumber}
                          onChange={(e) => handleChange("cardNumber", e.target.value)}
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                          required
                          maxLength={19}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardHolder" className="text-white font-semibold">Card Holder</Label>
                          <Input
                            id="cardHolder"
                            type="text"
                            placeholder="John Doe"
                            value={billingData.cardHolder}
                            onChange={(e) => handleChange("cardHolder", e.target.value)}
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expiryDate" className="text-white font-semibold">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            type="text"
                            placeholder="MM/YY"
                            value={billingData.expiryDate}
                            onChange={(e) => handleChange("expiryDate", e.target.value)}
                            className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                            required
                            maxLength={5}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-white font-semibold">CVV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          placeholder="123"
                          value={billingData.cvv}
                          onChange={(e) => handleChange("cvv", e.target.value)}
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900 w-32"
                          required
                          maxLength={4}
                        />
                      </div>
                    </>
                  )}

                  {billingData.paymentMethod === "payfast" && (
                    <div className="space-y-2">
                      <Label htmlFor="payfastEmail" className="text-white font-semibold">PayFast Email</Label>
                      <Input
                        id="payfastEmail"
                        type="email"
                        placeholder="your-email@example.com"
                        value={billingData.payfastEmail}
                        onChange={(e) => handleChange("payfastEmail", e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                        required
                      />
                      <p className="text-gray-300 text-sm">You will be redirected to PayFast to complete your payment securely.</p>
                    </div>
                  )}

                  {billingData.paymentMethod === "bank-transfer" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="bankName" className="text-white font-semibold">Bank Name</Label>
                        <Input
                          id="bankName"
                          type="text"
                          placeholder="e.g., Standard Bank, FNB, ABSA"
                          value={billingData.bankName}
                          onChange={(e) => handleChange("bankName", e.target.value)}
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankAccount" className="text-white font-semibold">Account Number</Label>
                        <Input
                          id="bankAccount"
                          type="text"
                          placeholder="Enter your account number"
                          value={billingData.bankAccount}
                          onChange={(e) => handleChange("bankAccount", e.target.value)}
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountHolder" className="text-white font-semibold">Account Holder Name</Label>
                        <Input
                          id="accountHolder"
                          type="text"
                          placeholder="Enter account holder name"
                          value={billingData.accountHolder}
                          onChange={(e) => handleChange("accountHolder", e.target.value)}
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                          required
                        />
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Receipt className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-800 font-semibold">Invoice Generation</span>
                        </div>
                        <p className="text-blue-700 text-sm">
                          An invoice will be generated with bank transfer details. Please include the invoice number as payment reference.
                        </p>
                      </div>
                    </>
                  )}

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

                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Amount:</span>
                      <span className="text-white font-bold text-xl">${estimatedCost}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : 
                     billingData.paymentMethod === "bank-transfer" ? `Generate Invoice - R${estimatedCost}` :
                     billingData.paymentMethod === "payfast" ? `Proceed to PayFast - R${estimatedCost}` :
                     `Pay R${estimatedCost}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
