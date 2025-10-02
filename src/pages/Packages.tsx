import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { packagesAPI } from "@/services/api";
import { useNavigate } from "react-router-dom";
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
      <LearnerLayout>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h2 style={{ color: '#374151', fontSize: '18px', fontWeight: '600' }}>
              Loading packages...
            </h2>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  if (error) {
    return (
      <LearnerLayout>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ 
            textAlign: 'center',
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '400px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ color: '#dc2626', fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
              Error Loading Packages
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <style>
        {`
          .packages-grid {
            display: grid;
            gap: 24px;
            margin-bottom: 60px;
            grid-template-columns: 1fr; /* Default: 1 column on mobile */
          }
          
          /* Bootstrap-like breakpoints for col-lg-3 (4 columns on large screens) */
          
          /* Small devices (landscape phones, 576px and up) */
          @media (min-width: 576px) {
            .packages-grid {
              grid-template-columns: repeat(2, 1fr); /* 2 columns */
            }
          }
          
          /* Medium devices (tablets, 768px and up) */
          @media (min-width: 768px) {
            .packages-grid {
              grid-template-columns: repeat(3, 1fr); /* 3 columns */
            }
          }
          
          /* Large devices (desktops, 992px and up) - col-lg-3 equivalent */
          @media (min-width: 992px) {
            .packages-grid {
              grid-template-columns: repeat(4, 1fr); /* 4 columns = col-lg-3 */
            }
          }
          
          /* Extra large devices (large desktops, 1200px and up) */
          @media (min-width: 1200px) {
            .packages-grid {
              grid-template-columns: repeat(4, 1fr); /* Keep 4 columns */
            }
          }
        `}
      </style>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '40px',
            padding: '20px 0'
          }}>
            <h1 style={{ 
              color: '#111827', 
              fontSize: '36px', 
              fontWeight: '700', 
              marginBottom: '12px',
              lineHeight: '1.2'
            }}>
              Service Packages
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '18px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Choose the perfect learning package for your needs. Start with our free package or upgrade for more features.
            </p>
          </div>

          {/* Packages Grid - Bootstrap col-lg-3 equivalent (4 columns on large screens) */}
          <div className="packages-grid">
            {packages.map((pkg) => {
              const categoryColor = getCategoryColor(pkg.category);
              
              return (
                <div 
                  key={pkg.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                    border: '1px solid #e5e7eb',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    transform: pkg.popular ? 'scale(1.02)' : 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = pkg.popular ? 'scale(1.02)' : 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  {/* Badges */}
                  {pkg.popular && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      ⭐ Most Popular
                    </div>
                  )}
                  
                  {pkg.recommended && !pkg.isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#10b981',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      ✓ Recommended
                    </div>
                  )}
                  
                  {pkg.isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}>
                      ✓ Current Package
                    </div>
                  )}

                  {/* Package Header */}
                  <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '24px',
                    paddingTop: pkg.popular || pkg.recommended || pkg.isCurrent ? '12px' : '0'
                  }}>
                    <div style={{ 
                      fontSize: '56px', 
                      marginBottom: '16px',
                      lineHeight: '1'
                    }}>
                      {pkg.icon}
                    </div>
                    <h2 style={{ 
                      color: '#111827', 
                      fontSize: '24px', 
                      fontWeight: '700', 
                      marginBottom: '8px',
                      lineHeight: '1.2'
                    }}>
                      {pkg.name}
                    </h2>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '15px', 
                      marginBottom: '16px',
                      lineHeight: '1.5'
                    }}>
                      {pkg.description}
                    </p>
                    <div style={{
                      backgroundColor: categoryColor.bg,
                      color: categoryColor.text,
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'inline-block',
                      textTransform: 'capitalize'
                    }}>
                      {pkg.category}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'baseline', 
                      justifyContent: 'center', 
                      gap: '12px',
                      marginBottom: '8px'
                    }}>
                      {pkg.originalPrice && (
                        <span style={{ 
                          fontSize: '18px', 
                          color: '#9ca3af', 
                          textDecoration: 'line-through',
                          fontWeight: '500'
                        }}>
                          R{pkg.originalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      )}
                      <span style={{ 
                        fontSize: '36px', 
                        fontWeight: '700', 
                        color: pkg.price === 0 ? '#10b981' : '#111827',
                        lineHeight: '1'
                      }}>
                        {pkg.price === 0 ? 'FREE' : `R${pkg.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </span>
                    </div>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '14px', 
                      fontWeight: '500',
                      margin: '0 0 12px 0'
                    }}>
                      {pkg.duration}
                    </p>
                    {pkg.originalPrice && (
                      <div style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        Save R{(pkg.originalPrice - pkg.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    )}
                    {pkg.price === 0 && (
                      <div style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        🎉 No Cost Forever!
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ 
                      color: '#111827', 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      marginBottom: '16px'
                    }}>
                      What's Included
                    </h3>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: 0 
                    }}>
                      {pkg.features.map((feature, index) => (
                        <li key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '12px', 
                          marginBottom: '12px',
                          fontSize: '14px',
                          color: '#374151',
                          lineHeight: '1.5'
                        }}>
                          <div style={{ 
                            color: '#10b981', 
                            marginTop: '2px',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}>
                            ✓
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations for Free Package */}
                  {pkg.category === 'free' && pkg.limitations && (
                    <div style={{
                      backgroundColor: '#fef3c7',
                      border: '1px solid #f59e0b',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '24px'
                    }}>
                      <h4 style={{ 
                        color: '#92400e', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ⚠️ Limitations
                      </h4>
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: 0 
                      }}>
                        {pkg.limitations.map((limitation, index) => (
                          <li key={index} style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            gap: '8px', 
                            marginBottom: '6px',
                            fontSize: '12px',
                            color: '#92400e',
                            lineHeight: '1.4'
                          }}>
                            <span style={{ 
                              color: '#dc2626', 
                              marginTop: '1px',
                              fontSize: '12px'
                            }}>
                              ✗
                            </span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <button
                    onClick={() => handlePurchasePackage(pkg.id)}
                    disabled={pkg.isCurrent}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      backgroundColor: pkg.isCurrent 
                        ? '#d1d5db' 
                        : pkg.price === 0 
                          ? '#10b981' 
                          : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: pkg.isCurrent ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                      opacity: pkg.isCurrent ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!pkg.isCurrent) {
                        e.currentTarget.style.backgroundColor = pkg.price === 0 ? '#059669' : '#2563eb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!pkg.isCurrent) {
                        e.currentTarget.style.backgroundColor = pkg.price === 0 ? '#10b981' : '#3b82f6';
                      }
                    }}
                  >
                    <span>
                      {pkg.isCurrent 
                        ? 'Current Package' 
                        : pkg.price === 0 
                          ? 'Get Free Package' 
                          : 'Choose Package'
                      }
                    </span>
                    {!pkg.isCurrent && <span style={{ fontSize: '18px' }}>→</span>}
                    {pkg.isCurrent && <span style={{ fontSize: '16px' }}>✓</span>}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Additional Information */}
          <div style={{ 
            marginTop: '60px',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <h2 style={{ 
              color: '#111827', 
              fontSize: '28px', 
              fontWeight: '700', 
              marginBottom: '24px', 
              textAlign: 'center'
            }}>
              Why Choose Our Packages?
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '32px' 
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '16px',
                  lineHeight: '1'
                }}>💳</div>
                <h3 style={{ 
                  color: '#111827', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '12px' 
                }}>
                  Flexible Payment
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  Pay monthly or get discounts for longer commitments
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '16px',
                  lineHeight: '1'
                }}>🎓</div>
                <h3 style={{ 
                  color: '#111827', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '12px' 
                }}>
                  Expert Tutors
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  Learn from qualified and experienced educators
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '48px', 
                  marginBottom: '16px',
                  lineHeight: '1'
                }}>📱</div>
                <h3 style={{ 
                  color: '#111827', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '12px' 
                }}>
                  24/7 Support
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  Get help whenever you need it with our support team
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default Packages;