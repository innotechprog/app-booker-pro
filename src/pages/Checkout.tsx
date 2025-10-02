import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import LearnerLayout from "@/components/LearnerLayout";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  category: string;
}

const Checkout = () => {
  const { isAuthenticated, user } = useAuth();
  const { packageId } = useParams();
  const navigate = useNavigate();
  
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('payfast');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [bankTransferDetails, setBankTransferDetails] = useState({
    reference: '',
    amount: 0,
    bankName: 'Standard Bank',
    accountNumber: '1234567890',
    branchCode: '051001'
  });
  const [billingInfo, setBillingInfo] = useState({
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'South Africa'
  });
  const [processing, setProcessing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/learner/login');
      return;
    }

    // Mock package data - replace with actual API call
    const mockPackages: Package[] = [
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
        category: "premium"
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
        category: "enterprise"
      }
    ];

    const selectedPackage = mockPackages.find(pkg => pkg.id === packageId);
    if (selectedPackage) {
      setPackageData(selectedPackage);
    } else {
      navigate('/packages');
    }
    setLoading(false);
  }, [packageId, isAuthenticated, navigate, user]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setProcessing(true);
    
    if (paymentMethod === 'payfast') {
      // Redirect to PayFast payment gateway
      setTimeout(() => {
        setProcessing(false);
        alert('Redirecting to PayFast for secure payment processing...');
        // In a real implementation, this would redirect to PayFast
        navigate('/learner/dashboard?payment=success');
      }, 1000);
    } else if (paymentMethod === 'bank') {
      // Generate bank transfer details
      const reference = `EDU-${Date.now()}`;
      setBankTransferDetails(prev => ({
        ...prev,
        reference,
        amount: packageData?.price || 0
      }));
      setProcessing(false);
      alert('Bank transfer details generated! Please complete the transfer and your account will be activated.');
    } else {
      // Credit card processing
      setTimeout(() => {
        setProcessing(false);
        alert('Payment successful! You will be redirected to your dashboard.');
        navigate('/learner/dashboard');
      }, 2000);
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
              Loading checkout...
            </h2>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  if (!packageData) {
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
            <h2 style={{ color: '#dc2626', fontSize: '18px', fontWeight: '600' }}>
              Package not found
            </h2>
            <button
              onClick={() => navigate('/packages')}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '16px'
              }}
            >
              Back to Packages
            </button>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{ 
            marginBottom: '32px',
            padding: '20px 0'
          }}>
            <h1 style={{ 
              color: '#111827', 
              fontSize: '32px', 
              fontWeight: '700', 
              marginBottom: '8px'
            }}>
              Complete Your Purchase
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '16px'
            }}>
              Secure checkout for your {packageData.name}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '32px'
          }}>
            {/* Checkout Form */}
            <div>
              <form onSubmit={handlePayment}>
                {/* Payment Method Selection */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <h2 style={{ 
                    color: '#111827', 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    marginBottom: '20px'
                  }}>
                    Choose Payment Method
                  </h2>
                  
                  {/* Payment Method Options */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '20px'
                    }}>
                      {/* PayFast Option */}
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        border: paymentMethod === 'payfast' ? '2px solid #10b981' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        backgroundColor: paymentMethod === 'payfast' ? '#f0fdf4' : 'white',
                        transition: 'all 0.2s'
                      }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="payfast"
                          checked={paymentMethod === 'payfast'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ marginRight: '12px' }}
                        />
                        <div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <span style={{ fontSize: '20px' }}>💳</span>
                            <span style={{ 
                              fontWeight: '600', 
                              color: '#111827' 
                            }}>
                              PayFast
                            </span>
                          </div>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#6b7280',
                            margin: 0 
                          }}>
                            Secure online payment
                          </p>
                        </div>
                      </label>

                      {/* Bank Transfer Option */}
                      <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px',
                        border: paymentMethod === 'bank' ? '2px solid #10b981' : '2px solid #e5e7eb',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        backgroundColor: paymentMethod === 'bank' ? '#f0fdf4' : 'white',
                        transition: 'all 0.2s'
                      }}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ marginRight: '12px' }}
                        />
                        <div>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            marginBottom: '4px'
                          }}>
                            <span style={{ fontSize: '20px' }}>🏦</span>
                            <span style={{ 
                              fontWeight: '600', 
                              color: '#111827' 
                            }}>
                              Bank Transfer
                            </span>
                          </div>
                          <p style={{ 
                            fontSize: '12px', 
                            color: '#6b7280',
                            margin: 0 
                          }}>
                            Direct bank deposit
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* PayFast Payment Details */}
                  {paymentMethod === 'payfast' && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '18px' }}>💳</span>
                        <h3 style={{ 
                          color: '#111827', 
                          fontSize: '16px', 
                          fontWeight: '600',
                          margin: 0
                        }}>
                          PayFast Payment
                        </h3>
                      </div>
                      <p style={{ 
                        color: '#374151', 
                        fontSize: '14px',
                        margin: '0 0 12px 0'
                      }}>
                        You will be redirected to PayFast's secure payment gateway to complete your transaction.
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        color: '#059669'
                      }}>
                        <span>🔒</span>
                        <span>SSL encrypted • PCI DSS compliant • 256-bit security</span>
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Details */}
                  {paymentMethod === 'bank' && (
                    <div style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      padding: '16px',
                      border: '1px solid #fde68a'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <span style={{ fontSize: '18px' }}>🏦</span>
                        <h3 style={{ 
                          color: '#111827', 
                          fontSize: '16px', 
                          fontWeight: '600',
                          margin: 0
                        }}>
                          Bank Transfer Details
                        </h3>
                      </div>
                      <div style={{ 
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ 
                            color: '#6b7280', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            Bank: 
                          </span>
                          <span style={{ 
                            color: '#111827', 
                            fontSize: '14px',
                            fontWeight: '600',
                            marginLeft: '8px'
                          }}>
                            {bankTransferDetails.bankName}
                          </span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ 
                            color: '#6b7280', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            Account Number: 
                          </span>
                          <span style={{ 
                            color: '#111827', 
                            fontSize: '14px',
                            fontWeight: '600',
                            marginLeft: '8px'
                          }}>
                            {bankTransferDetails.accountNumber}
                          </span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ 
                            color: '#6b7280', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            Branch Code: 
                          </span>
                          <span style={{ 
                            color: '#111827', 
                            fontSize: '14px',
                            fontWeight: '600',
                            marginLeft: '8px'
                          }}>
                            {bankTransferDetails.branchCode}
                          </span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ 
                            color: '#6b7280', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            Reference: 
                          </span>
                          <span style={{ 
                            color: '#111827', 
                            fontSize: '14px',
                            fontWeight: '600',
                            marginLeft: '8px'
                          }}>
                            {bankTransferDetails.reference || `EDU-${Date.now()}`}
                          </span>
                        </div>
                        <div>
                          <span style={{ 
                            color: '#6b7280', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            Amount: 
                          </span>
                          <span style={{ 
                            color: '#111827', 
                            fontSize: '16px',
                            fontWeight: '700',
                            marginLeft: '8px'
                          }}>
                            R{packageData?.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <p style={{ 
                        color: '#92400e', 
                        fontSize: '12px',
                        margin: 0
                      }}>
                        ⚠️ Please use the exact reference number when making your transfer. Your account will be activated within 24 hours after payment confirmation.
                      </p>
                    </div>
                  )}
                </div>

                {/* Billing Information */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <h2 style={{ 
                    color: '#111827', 
                    fontSize: '20px', 
                    fontWeight: '600', 
                    marginBottom: '20px'
                  }}>
                    Billing Information
                  </h2>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={billingInfo.email}
                      onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ 
                      display: 'block',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px'
                    }}>
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="123 Main Street"
                      value={billingInfo.address}
                      onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                      required
                    />
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <label style={{ 
                        display: 'block',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="Cape Town"
                        value={billingInfo.city}
                        onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ 
                        display: 'block',
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        Postal Code
                      </label>
                      <input
                        type="text"
                        placeholder="8000"
                        value={billingInfo.postalCode}
                        onChange={(e) => setBillingInfo({...billingInfo, postalCode: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      style={{
                        marginTop: '4px'
                      }}
                    />
                    <span style={{ 
                      color: '#374151',
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      I agree to the <a href="#" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Terms of Service</a> and <a href="#" style={{ color: '#3b82f6', textDecoration: 'underline' }}>Privacy Policy</a>
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing || !agreedToTerms}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: processing || !agreedToTerms ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: processing || !agreedToTerms ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {processing ? (
                    <>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      {paymentMethod === 'payfast' ? 'Redirecting to PayFast...' : 
                       paymentMethod === 'bank' ? 'Generating Transfer Details...' : 
                       'Processing Payment...'}
                    </>
                  ) : (
                    <>
                      <span>
                        {paymentMethod === 'payfast' ? 'Pay with PayFast' : 
                         paymentMethod === 'bank' ? 'Generate Bank Transfer Details' : 
                         'Complete Purchase'}
                      </span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                position: 'sticky',
                top: '20px'
              }}>
                <h2 style={{ 
                  color: '#111827', 
                  fontSize: '20px', 
                  fontWeight: '600', 
                  marginBottom: '20px'
                }}>
                  Order Summary
                </h2>

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    color: '#111827', 
                    fontSize: '18px', 
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>
                    {packageData.name}
                  </h3>
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    marginBottom: '16px'
                  }}>
                    {packageData.description}
                  </p>
                  
                  <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <h4 style={{ 
                      color: '#374151', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      marginBottom: '12px'
                    }}>
                      What's included:
                    </h4>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: 0 
                    }}>
                      {packageData.features.map((feature, index) => (
                        <li key={index} style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '8px', 
                          marginBottom: '6px',
                          fontSize: '12px',
                          color: '#374151'
                        }}>
                          <span style={{ color: '#10b981' }}>✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '20px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      Duration
                    </span>
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                      {packageData.duration}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>
                      Payment Method
                    </span>
                    <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                      {paymentMethod === 'payfast' ? '💳 PayFast' : 
                       paymentMethod === 'bank' ? '🏦 Bank Transfer' : 
                       '💳 Credit Card'}
                    </span>
                  </div>
                  
                  {packageData.originalPrice && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        Original Price
                      </span>
                      <span style={{ 
                        color: '#9ca3af', 
                        fontSize: '14px',
                        textDecoration: 'line-through'
                      }}>
                        R{packageData.originalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '12px',
                    marginTop: '12px'
                  }}>
                    <span style={{ color: '#111827', fontSize: '18px', fontWeight: '600' }}>
                      Total
                    </span>
                    <span style={{ color: '#111827', fontSize: '24px', fontWeight: '700' }}>
                      R{packageData.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div style={{
                  marginTop: '20px',
                  padding: '12px',
                  backgroundColor: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  <p style={{ 
                    color: '#0369a1', 
                    fontSize: '12px',
                    margin: 0,
                    textAlign: 'center'
                  }}>
                    🔒 Your payment information is secure and encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default Checkout;
