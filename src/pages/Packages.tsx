import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { packagesAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  Star, 
  Clock, 
  Users, 
  ArrowRight,
  AlertCircle,
  XCircle
} from "lucide-react";
import LearnerLayout from "@/components/LearnerLayout";

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  category: 'free' | 'basic' | 'premium' | 'enterprise';
  icon: string;
  color: string;
  maxStudents?: number;
  subjects: string[];
  limitations?: string[];
  isCurrent?: boolean;
}

const Packages = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserPackage, setCurrentUserPackage] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/learner/login");
      return;
    }

    // Load packages and user's current package
    const loadPackages = async () => {
      setLoading(true);
      try {
        // Fetch user's current package
        const userPackageResponse = await packagesAPI.getUserPackage();
        console.log('User package response:', userPackageResponse);
        if (userPackageResponse.success) {
          setCurrentUserPackage(userPackageResponse.package);
        }
      } catch (error) {
        console.error('Error fetching user package:', error);
      }
      
      // Mock data - replace with actual API call when backend is ready
        setPackages([
          {
            id: "1",
            name: "Free Package",
            description: "Perfect for trying out our platform with basic features",
            price: 0,
            originalPrice: null,
            duration: "Forever Free",
            features: [
              "Create up to 5 notes",
              "View 5 tutorials per subject",
              "Book tutoring sessions",
              "Set up to 2 reminders",
              "Choose 2 subjects maximum",
              "Basic progress tracking",
              "Email support"
            ],
            category: 'free',
            icon: "🆓",
            color: "bg-green-50 border-green-200",
            maxStudents: 1,
            subjects: ["Choose 2 subjects only"],
            recommended: true,
            limitations: [
              "Cannot view teacher profiles",
              "Limited to 5 notes total",
              "Limited to 5 tutorials per subject",
              "Maximum 2 reminders",
              "Maximum 2 subjects"
            ]
          },
          {
            id: "2",
            name: "Premium Package",
            description: "Most popular choice for serious learners",
            price: 2999.00,
            originalPrice: 4499.00,
            duration: "3 Months",
            features: [
              "20 hours of tutoring",
              "Premium study materials",
              "Priority support",
              "Advanced progress tracking",
              "Group study sessions",
              "Exam preparation",
              "24/7 chat support"
            ],
            popular: true,
            category: 'premium',
            icon: "⭐",
            color: "bg-purple-50 border-purple-200",
            maxStudents: 3,
            subjects: ["Mathematics", "Science", "English", "History", "Geography"]
          },
          {
            id: "3",
            name: "Enterprise Package",
            description: "Complete learning solution for advanced students",
            price: 5999.00,
            originalPrice: 8999.00,
            duration: "6 Months",
            features: [
              "50 hours of tutoring",
              "All premium materials",
              "Dedicated tutor",
              "Custom study plans",
              "Unlimited group sessions",
              "Exam preparation",
              "Career counseling",
              "24/7 priority support",
              "Certificate of completion"
            ],
            category: 'enterprise',
            icon: "👑",
            color: "bg-gold-50 border-gold-200",
            maxStudents: 5,
            subjects: ["All Subjects Available"]
          },
          {
            id: "4",
            name: "Subject-Specific Package",
            description: "Focused tutoring in one specific subject",
            price: 2299.00,
            originalPrice: 2999.00,
            duration: "2 Months",
            features: [
              "10 hours of specialized tutoring",
              "Subject-specific materials",
              "Expert tutor matching",
              "Progress reports",
              "Practice tests"
            ],
            category: 'basic',
            icon: "🎯",
            color: "bg-green-50 border-green-200",
            maxStudents: 1,
            subjects: ["Choose One Subject"]
          }
        ]);
        
        // Mark current package
        setPackages(prevPackages => {
          const currentPackageId = currentUserPackage?.id || '1'; // Default to free package if no current package
          console.log('Setting packages with current package ID:', currentPackageId);
          const updatedPackages = prevPackages.map(pkg => ({
            ...pkg,
            isCurrent: pkg.id === currentPackageId
          }));
          console.log('Updated packages:', updatedPackages);
          return updatedPackages;
        });
        
        setLoading(false);
    };

    loadPackages();
  }, [isAuthenticated, navigate]);


  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'free':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Free</Badge>;
      case 'basic':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Basic</Badge>;
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Premium</Badge>;
      case 'enterprise':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Enterprise</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  };

  const handlePurchasePackage = (packageId: string) => {
    // Navigate to purchase/checkout page
    navigate(`/packages/${packageId}/purchase`);
  };


  if (loading) {
    return (
      <LearnerLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  console.log('Rendering packages page with packages:', packages);

  return (
    <LearnerLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Packages</h1>
            <p className="text-gray-600">Choose the perfect learning package for your needs</p>
          </div>


          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative ${pkg.color} shadow-lg hover:shadow-xl transition-all duration-300 ${
                  pkg.popular ? 'ring-2 ring-purple-300 scale-105' : ''
                } ${
                  pkg.recommended && !pkg.isCurrent ? 'ring-2 ring-green-300 scale-105' : ''
                } ${
                  pkg.isCurrent ? 'ring-2 ring-blue-300 scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {pkg.recommended && !pkg.isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-1">
                      <Check className="h-3 w-3 mr-1" />
                      Recommended
                    </Badge>
                  </div>
                )}
                
                {pkg.isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      <Check className="h-3 w-3 mr-1" />
                      Current Package
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="text-4xl mb-2">{pkg.icon}</div>
                  <CardTitle className="text-xl font-bold text-gray-900">{pkg.name}</CardTitle>
                  <p className="text-gray-600 text-sm">{pkg.description}</p>
                  {getCategoryBadge(pkg.category)}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {pkg.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          R{pkg.originalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                      <span className={`text-3xl font-bold ${pkg.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {pkg.price === 0 ? 'FREE' : `R${pkg.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{pkg.duration}</p>
                    {pkg.originalPrice && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 mt-2">
                        Save R{(pkg.originalPrice - pkg.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Badge>
                    )}
                    {pkg.price === 0 && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 mt-2">
                        🎉 No Cost Forever!
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      What's Included
                    </h4>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                          <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations for Free Package */}
                  {pkg.category === 'free' && pkg.limitations && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                        Limitations
                      </h4>
                      <ul className="space-y-2">
                        {pkg.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-orange-800">
                            <XCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  {/* Package Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Max Students:</span>
                      <span className="font-medium text-gray-900">{pkg.maxStudents}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Subjects:</span>
                      <span className="font-medium text-gray-900">
                        {pkg.subjects.length > 1 ? `${pkg.subjects.length} subjects` : pkg.subjects[0]}
                      </span>
                    </div>
                  </div>

                  {/* Purchase Button */}
                  <Button 
                    onClick={() => handlePurchasePackage(pkg.id)}
                    disabled={pkg.isCurrent}
                    className={`w-full py-3 ${
                      pkg.isCurrent 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : pkg.price === 0 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                    size="lg"
                  >
                    <span>
                      {pkg.isCurrent 
                        ? 'Current Package' 
                        : pkg.price === 0 
                          ? 'Get Free Package' 
                          : 'Choose Package'
                      }
                    </span>
                    {!pkg.isCurrent && <ArrowRight className="h-4 w-4 ml-2" />}
                    {pkg.isCurrent && <Check className="h-4 w-4 ml-2" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <Gift className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Payment</h3>
                <p className="text-sm text-gray-600">Pay monthly or get discounts for longer commitments</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Instant Access</h3>
                <p className="text-sm text-gray-600">Start learning immediately after purchase</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Expert Tutors</h3>
                <p className="text-sm text-gray-600">Learn from qualified and experienced educators</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default Packages;

