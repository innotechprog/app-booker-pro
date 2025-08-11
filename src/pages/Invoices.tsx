import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Receipt,
  FileText,
  Eye,
  CreditCard,
  CheckCircle,
  Clock
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface Invoice {
  id: string;
  bookingId: string;
  serviceType: string;
  specificService: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  billingAddress: string;
  cardLast4?: string;
  invoiceNumber: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

const Invoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Load invoices from both bookings and dedicated invoices storage
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
    const dedicatedInvoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    
    // Get paid bookings that should have invoices
    const paidBookings = bookings.filter((booking: any) => 
      (booking.paymentStatus === "paid" || booking.paymentStatus === "pending") && 
      booking.paymentMethod && 
      booking.paymentMethod !== "bank-transfer"
    );

    // Create invoice data from paid bookings
    const bookingInvoices = paidBookings.map((booking: any, index: number) => ({
      id: `inv-${Date.now()}-${index}`,
      bookingId: booking.id,
      serviceType: booking.serviceType,
      specificService: booking.specificService || "Send Me Service",
      amount: booking.estimatedCost,
      paymentMethod: booking.paymentMethod,
      paymentStatus: booking.paymentStatus,
      paymentDate: booking.createdAt,
      billingAddress: booking.billingAddress || "123 Main St, Johannesburg, 2000",
      cardLast4: booking.paymentMethod === "credit-card" ? "****1234" : undefined,
      invoiceNumber: `INV-${Date.now()}-${index + 1}`,
      description: booking.description,
      date: booking.date,
      time: booking.time,
      location: booking.location,
    }));

    // Combine dedicated invoices with booking invoices
    const invoiceData = [...dedicatedInvoices, ...bookingInvoices];

    setInvoices(invoiceData);
    setFilteredInvoices(invoiceData);
  }, [navigate]);

  useEffect(() => {
    let filtered = invoices;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.specificService.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.paymentStatus === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter]);

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulate invoice download
    toast.success(`Downloading invoice ${invoice.invoiceNumber}...`);
    
    // In a real app, this would generate and download a PDF
    setTimeout(() => {
      toast.success("Invoice downloaded successfully!");
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit-card":
        return <CreditCard className="h-4 w-4" />;
      case "paypal":
        return <Receipt className="h-4 w-4" />;
      case "bank-transfer":
        return <FileText className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-4 text-white hover:text-blue-300 hover:bg-white/10 px-4 py-2 rounded-xl transition-all duration-300 group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-white">Invoices</h1>
            <p className="text-gray-300 mt-2">View and download your payment history</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-white font-semibold flex items-center">
                  <Search className="mr-2 h-4 w-4" />
                  Search Invoices
                </Label>
                <Input
                  placeholder="Search by invoice number or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white font-semibold flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  Payment Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 bg-white text-gray-900">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Invoices</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="text-white">
                  <p className="text-sm text-gray-300">Total Invoices</p>
                  <p className="text-2xl font-bold">{filteredInvoices.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl">
              <CardContent className="p-12 text-center">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No invoices found</h3>
                <p className="text-gray-300">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Complete a booking to see your first invoice"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInvoices.map((invoice) => (
              <Card 
                key={invoice.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 cursor-pointer"
                onClick={() => handleInvoiceClick(invoice)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        {getPaymentMethodIcon(invoice.paymentMethod)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{invoice.invoiceNumber}</h3>
                        <p className="text-gray-300 text-sm">{invoice.serviceType}</p>
                        <p className="text-gray-400 text-xs">{formatDate(invoice.paymentDate)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-bold text-lg">${invoice.amount}</p>
                        <Badge className={`${getStatusColor(invoice.paymentStatus)} text-white`}>
                          {invoice.paymentStatus}
                        </Badge>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadInvoice(invoice);
                        }}
                        className="text-white hover:text-blue-300 hover:bg-white/10"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Invoice Details Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="bg-white/10 backdrop-blur-sm border-white/20 shadow-xl max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-bold flex items-center">
              <Receipt className="mr-2 h-5 w-5 text-blue-400" />
              Invoice Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedInvoice.invoiceNumber}</h3>
                  <p className="text-gray-300">Invoice Date: {formatDate(selectedInvoice.paymentDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-2xl">${selectedInvoice.amount}</p>
                  <Badge className={`${getStatusColor(selectedInvoice.paymentStatus)} text-white`}>
                    {selectedInvoice.paymentStatus}
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
                      <p className="text-white font-semibold">{formatDate(selectedInvoice.date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Service Time</p>
                      <p className="text-white font-semibold">{selectedInvoice.time}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Payment Method</p>
                      <p className="text-white font-semibold capitalize">
                        {selectedInvoice.paymentMethod.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-gray-300 text-sm">Payment Date</p>
                      <p className="text-white font-semibold">{formatDate(selectedInvoice.paymentDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Information */}
              <div className="p-4 bg-white/5 rounded-xl">
                <h4 className="text-white font-semibold mb-3">Service Information</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    <span className="font-medium">Service Type:</span> {selectedInvoice.serviceType}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Specific Service:</span> {selectedInvoice.specificService}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Location:</span> {selectedInvoice.location}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Description:</span> {selectedInvoice.description}
                  </p>
                </div>
              </div>

                             {/* Billing Information */}
               <div className="p-4 bg-white/5 rounded-xl">
                 <h4 className="text-white font-semibold mb-3">Billing Information</h4>
                 <div className="space-y-2 text-sm">
                   <p className="text-gray-300">
                     <span className="font-medium">Billing Address:</span> {selectedInvoice.billingAddress}
                   </p>
                   {selectedInvoice.cardLast4 && (
                     <p className="text-gray-300">
                       <span className="font-medium">Card:</span> {selectedInvoice.cardLast4}
                     </p>
                   )}
                   {selectedInvoice.bankDetails && (
                     <div className="space-y-2 mt-3 p-3 bg-white/5 rounded-lg">
                       <h5 className="text-white font-semibold text-sm">Bank Transfer Details</h5>
                       <p className="text-gray-300 text-sm">
                         <span className="font-medium">Bank:</span> {selectedInvoice.bankDetails.bankName}
                       </p>
                       <p className="text-gray-300 text-sm">
                         <span className="font-medium">Account:</span> {selectedInvoice.bankDetails.bankAccount}
                       </p>
                       <p className="text-gray-300 text-sm">
                         <span className="font-medium">Holder:</span> {selectedInvoice.bankDetails.accountHolder}
                       </p>
                       <p className="text-gray-300 text-sm">
                         <span className="font-medium">Reference:</span> {selectedInvoice.invoiceNumber}
                       </p>
                     </div>
                   )}
                 </div>
               </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <Button
                  onClick={() => setIsInvoiceModalOpen(false)}
                  variant="outline"
                  className="border-2 border-gray-300 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  Close
                </Button>
                <Button
                  onClick={() => handleDownloadInvoice(selectedInvoice)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices;
