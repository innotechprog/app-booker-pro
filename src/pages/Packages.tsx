import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { packagesAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Footer from "@/components/Footer";

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
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set packages immediately - no API dependency
        const mockPackages: ServicePackage[] = [
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
            isCurrent: true,
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
            subjects: ["Mathematics", "Science", "English", "History", "Geography"],
            isCurrent: false
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
            subjects: ["All Subjects Available"],
            isCurrent: false
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
            subjects: ["Choose One Subject"],
            isCurrent: false
          }
        ];

        setPackages(mockPackages);
        
        // Try to fetch user's current package if authenticated
        if (isAuthenticated) {
          try {
            const response = await packagesAPI.getUserPackage();
            if (response.success && response.package) {
              // Update current package status
              setPackages(prevPackages => 
                prevPackages.map(pkg => ({
                  ...pkg,
                  isCurrent: pkg.id === response.package.id
                }))
              );
            }
          } catch (apiError) {
            console.warn('Could not fetch user package:', apiError);
            // Continue with mock data - this is not critical
          }
        }
      } catch (error) {
        console.error('Error loading packages:', error);
        setError('Failed to load packages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [isAuthenticated]);

  const handlePurchasePackage = (packageId: string) => {
    if (!isAuthenticated) {
      navigate('/learner/login');
      return;
    }
    
    // Navigate to checkout page
    navigate(`/checkout/${packageId}`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'free':
        return { bg: '#dcfce7', text: '#166534' };
      case 'basic':
        return { bg: '#dbeafe', text: '#1e40af' };
      case 'premium':
        return { bg: '#f3e8ff', text: '#7c2d12' };
      case 'enterprise':
        return { bg: '#fef3c7', text: '#92400e' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-5"></div>
            <h2 className="text-gray-700 text-lg font-semibold">
              Loading packages...
            </h2>
          </div>
        </div>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-10 rounded-xl shadow-sm max-w-md">
            <div className="text-5xl mb-5">⚠️</div>
            <h2 className="text-red-600 text-lg font-semibold mb-3">
              Error Loading Packages
            </h2>
            <p className="text-gray-600 text-sm mb-5">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Service Packages
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the perfect learning package for your needs. Start with our free package or upgrade for more features.
            </p>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {packages.map((pkg) => {
              const categoryColor = getCategoryColor(pkg.category);
              
              return (
                <div 
                  key={pkg.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col h-full ${
                    pkg.popular ? 'scale-105 border-purple-300' : ''
                  }`}
                >
                  {/* Badges */}
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                      ⭐ Most Popular
                    </div>
                  )}
                  
                  {pkg.recommended && !pkg.isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                      ✓ Recommended
                    </div>
                  )}
                  
                  {pkg.isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                      ✓ Current Package
                    </div>
                  )}

                  {/* Package Header */}
                  <div className={`text-center mb-6 ${pkg.popular || pkg.recommended || pkg.isCurrent ? 'pt-3' : ''}`}>
                    <div className="text-6xl mb-4">
                      {pkg.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {pkg.name}
                    </h2>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {pkg.description}
                    </p>
                    <div className={`inline-block px-4 py-1 rounded-full text-xs font-semibold capitalize`}
                         style={{ backgroundColor: categoryColor.bg, color: categoryColor.text }}>
                      {pkg.category}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6 p-5 bg-gray-50 rounded-xl">
                    <div className="flex items-baseline justify-center gap-3 mb-2">
                      {pkg.originalPrice && (
                        <span className="text-lg text-gray-400 line-through font-medium">
                          R{pkg.originalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                      <span className={`text-4xl font-bold ${pkg.price === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                        {pkg.price === 0 ? 'FREE' : `R${pkg.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm font-medium mb-3">
                      {pkg.duration}
                    </p>
                    {pkg.originalPrice && (
                      <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-semibold">
                        Save R{(pkg.originalPrice - pkg.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                    {pkg.price === 0 && (
                      <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-lg text-xs font-semibold">
                        🎉 No Cost Forever!
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      What's Included
                    </h3>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                          <div className="text-green-600 mt-0.5 font-bold text-base">
                            ✓
                          </div>
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations for Free Package */}
                  {pkg.category === 'free' && pkg.limitations && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                      <h4 className="text-yellow-800 text-sm font-semibold mb-3 flex items-center gap-2">
                        ⚠️ Limitations
                      </h4>
                      <ul className="space-y-2">
                        {pkg.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start gap-2 text-xs text-yellow-800">
                            <span className="text-red-600 mt-0.5 text-xs">
                              ✗
                            </span>
                            <span className="leading-relaxed">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handlePurchasePackage(pkg.id)}
                      disabled={pkg.isCurrent}
                      className={`w-full py-4 px-5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                        pkg.isCurrent 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : pkg.price === 0 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <span>
                        {pkg.isCurrent 
                          ? 'Current Package' 
                          : pkg.price === 0 
                            ? 'Get Free Package' 
                            : 'Choose Package'
                        }
                      </span>
                      {!pkg.isCurrent && <span className="text-lg">→</span>}
                      {pkg.isCurrent && <span className="text-base">✓</span>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Information */}
          <div className="mt-16 p-10 bg-white rounded-2xl shadow-sm">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Choose Our Packages?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Flexible Payment
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Pay monthly or get discounts for longer commitments
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Expert Tutors
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Learn from qualified and experienced educators
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  24/7 Support
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Get help whenever you need it with our support team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </DashboardLayout>
  );
};

export default Packages;