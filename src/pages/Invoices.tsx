import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

const Invoices = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/learner/login");
      return;
    }

    // Simulate loading invoices from API
    const loadInvoices = async () => {
      setLoading(true);
      // Mock data - replace with actual API call
      setTimeout(() => {
        setInvoices([
          {
            id: "1",
            invoiceNumber: "INV-2024-001",
            date: "2024-01-15",
            dueDate: "2024-02-15",
            amount: 4499.00,
            status: "paid",
            description: "Premium Tutoring Package - Mathematics",
            items: [
              { name: "Mathematics Tutoring (10 hours)", quantity: 10, price: 375.00 },
              { name: "Study Materials", quantity: 1, price: 749.00 }
            ]
          },
          {
            id: "2",
            invoiceNumber: "INV-2024-002",
            date: "2024-02-01",
            dueDate: "2024-03-01",
            amount: 2999.00,
            status: "pending",
            description: "Science Tutoring Package - Grade 12",
            items: [
              { name: "Science Tutoring (8 hours)", quantity: 8, price: 337.50 },
              { name: "Lab Materials", quantity: 1, price: 299.00 }
            ]
          },
          {
            id: "3",
            invoiceNumber: "INV-2024-003",
            date: "2024-01-20",
            dueDate: "2024-02-20",
            amount: 2249.00,
            status: "overdue",
            description: "English Language Support",
            items: [
              { name: "English Tutoring (6 hours)", quantity: 6, price: 300.00 },
              { name: "Writing Workshop", quantity: 1, price: 449.00 }
            ]
          }
        ]);
        setLoading(false);
      }, 1000);
    };

    loadInvoices();
  }, [isAuthenticated, navigate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    // Simulate PDF download
    alert(`Downloading invoice ${invoiceId} as PDF...`);
  };

  const handleViewInvoice = (invoiceId: string) => {
    // Navigate to detailed invoice view
    navigate(`/invoices/${invoiceId}`);
  };

  if (loading) {
  return (
      <Layout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
            <p className="text-gray-600">Manage your invoices and payment history</p>
          </div>
              
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {invoices.filter(inv => inv.status === 'paid').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {invoices.filter(inv => inv.status === 'pending').length}
                    </p>
              </div>
            </div>
          </CardContent>
        </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Owed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R{invoices
                        .filter(inv => inv.status !== 'paid')
                        .reduce((sum, inv) => sum + inv.amount, 0)
                        .toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoices List */}
          <div className="space-y-6">
            {invoices.length === 0 ? (
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="pt-12 pb-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                  <p className="text-gray-500">You don't have any invoices yet.</p>
              </CardContent>
            </Card>
          ) : (
              invoices.map((invoice) => (
                <Card key={invoice.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(invoice.status)}
                      <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {invoice.invoiceNumber}
                          </h3>
                          <p className="text-sm text-gray-600">{invoice.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          R{invoice.amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {getStatusBadge(invoice.status)}
                      </div>
                    </div>
                    
                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Invoice Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(invoice.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Items</p>
                          <p className="text-sm font-medium text-gray-900">
                            {invoice.items.length} items
                          </p>
                        </div>
                      </div>
                      </div>
                      
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice.id)}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default Invoices;