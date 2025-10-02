import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LearnerLayout from "@/components/LearnerLayout";

interface BillingInfo {
  id: string;
  packageName: string;
  price: number;
  originalPrice?: number;
  duration: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'expired' | 'upcoming' | 'cancelled';
  paymentMethod: string;
  nextBillingDate?: string;
}

const Billing = () => {
  const { isAuthenticated, user } = useAuth();
  const [billingHistory, setBillingHistory] = useState<BillingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] = useState<BillingInfo | null>(null);

  useEffect(() => {
    const loadBillingData = async () => {
      setLoading(true);
      
      // Mock billing data - replace with actual API calls
      const mockBillingHistory: BillingInfo[] = [
        {
          id: "1",
          packageName: "Free Package",
          price: 0,
          duration: "Forever Free",
          startDate: "2024-01-01",
          status: 'active',
          paymentMethod: "None"
        },
        {
          id: "2",
          packageName: "Premium Package",
          price: 2999.00,
          originalPrice: 4499.00,
          duration: "3 Months",
          startDate: "2024-01-15",
          endDate: "2024-04-15",
          status: 'expired',
          paymentMethod: "PayFast",
          nextBillingDate: "2024-04-15"
        },
        {
          id: "3",
          packageName: "Enterprise Package",
          price: 5999.00,
          duration: "6 Months",
          startDate: "2024-03-01",
          endDate: "2024-09-01",
          status: 'upcoming',
          paymentMethod: "Bank Transfer - Ref: EDU-123456",
          nextBillingDate: "2024-09-01"
        }
      ];

      // Find active subscription
      const active = mockBillingHistory.find(item => item.status === 'active');
      setActiveSubscription(active || null);
      
      setBillingHistory(mockBillingHistory);
      setLoading(false);
    };

    loadBillingData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#dcfce7', text: '#166534', border: '#22c55e' };
      case 'expired':
        return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
      case 'upcoming':
        return { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' };
      case 'cancelled':
        return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              Loading billing information...
            </h2>
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
              Billing & Subscriptions
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '18px',
              maxWidth: '600px'
            }}>
              Manage your subscription, view billing history, and update payment methods.
            </p>
          </div>

          {/* Current Subscription */}
          {activeSubscription && (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{ 
                color: '#111827', 
                fontSize: '24px', 
                fontWeight: '600', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '28px' }}>📋</span>
                Current Subscription
              </h2>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px'
              }}>
                <div>
                  <h3 style={{ 
                    color: '#374151', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px'
                  }}>
                    Package
                  </h3>
                  <p style={{ 
                    color: '#111827', 
                    fontSize: '18px', 
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {activeSubscription.packageName}
                  </p>
                </div>
                
                <div>
                  <h3 style={{ 
                    color: '#374151', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px'
                  }}>
                    Price
                  </h3>
                  <p style={{ 
                    color: '#111827', 
                    fontSize: '18px', 
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {activeSubscription.price === 0 ? 'FREE' : `R${activeSubscription.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </p>
                </div>
                
                <div>
                  <h3 style={{ 
                    color: '#374151', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px'
                  }}>
                    Duration
                  </h3>
                  <p style={{ 
                    color: '#111827', 
                    fontSize: '18px', 
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {activeSubscription.duration}
                  </p>
                </div>
                
                <div>
                  <h3 style={{ 
                    color: '#374151', 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px'
                  }}>
                    Status
                  </h3>
                  <div style={{
                    backgroundColor: getStatusColor(activeSubscription.status).bg,
                    color: getStatusColor(activeSubscription.status).text,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block',
                    textTransform: 'capitalize'
                  }}>
                    {activeSubscription.status}
                  </div>
                </div>
              </div>
              
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  margin: '0 0 8px 0'
                }}>
                  <strong>Started:</strong> {formatDate(activeSubscription.startDate)}
                </p>
                {activeSubscription.endDate && (
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    margin: '0 0 8px 0'
                  }}>
                    <strong>Ends:</strong> {formatDate(activeSubscription.endDate)}
                  </p>
                )}
                {activeSubscription.nextBillingDate && (
                  <p style={{ 
                    color: '#6b7280', 
                    fontSize: '14px',
                    margin: 0
                  }}>
                    <strong>Next Billing:</strong> {formatDate(activeSubscription.nextBillingDate)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Billing History */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              color: '#111827', 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '28px' }}>📊</span>
              Billing History
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ 
                    borderBottom: '2px solid #e5e7eb'
                  }}>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Package
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Amount
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Period
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Status
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Payment Method
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((item) => {
                    const statusColor = getStatusColor(item.status);
                    
                    return (
                      <tr key={item.id} style={{ 
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <td style={{ 
                          padding: '16px',
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {item.packageName}
                        </td>
                        <td style={{ 
                          padding: '16px',
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          <div>
                            {item.price === 0 ? 'FREE' : `R${item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            {item.originalPrice && (
                              <div style={{ 
                                fontSize: '12px', 
                                color: '#6b7280',
                                textDecoration: 'line-through'
                              }}>
                                R{item.originalPrice.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '16px',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          {item.duration}
                        </td>
                        <td style={{ 
                          padding: '16px'
                        }}>
                          <div style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block',
                            textTransform: 'capitalize'
                          }}>
                            {item.status}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '16px',
                          color: '#6b7280',
                          fontSize: '14px'
                        }}>
                          {item.paymentMethod}
                        </td>
                        <td style={{ 
                          padding: '16px'
                        }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}>
                              View Invoice
                            </button>
                            {item.status === 'active' && (
                              <button style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Methods */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '32px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              color: '#111827', 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '28px' }}>💳</span>
              Payment Methods
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '24px' }}>💳</div>
                  <div>
                    <h3 style={{ 
                      color: '#111827', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      margin: 0
                    }}>
                      Credit Card ending in 1234
                    </h3>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '14px',
                      margin: 0
                    }}>
                      Visa • Expires 12/25
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Update
                  </button>
                  <button style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    Remove
                  </button>
                </div>
              </div>

              <div style={{
                border: '2px dashed #d1d5db',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>➕</div>
                <h3 style={{ 
                  color: '#6b7280', 
                  fontSize: '16px', 
                  fontWeight: '600',
                  margin: '0 0 8px 0'
                }}>
                  Add Payment Method
                </h3>
                <p style={{ 
                  color: '#9ca3af', 
                  fontSize: '14px',
                  margin: 0
                }}>
                  Add a new credit card or bank account
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Options */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginTop: '32px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              color: '#111827', 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '28px' }}>🚀</span>
              Upgrade Options
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⭐</div>
                <h3 style={{ 
                  color: '#111827', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  margin: '0 0 8px 0'
                }}>
                  Premium Package
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  margin: '0 0 16px 0'
                }}>
                  R2,999.00 for 3 months
                </p>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}>
                  Upgrade Now
                </button>
              </div>

              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>👑</div>
                <h3 style={{ 
                  color: '#111827', 
                  fontSize: '18px', 
                  fontWeight: '600',
                  margin: '0 0 8px 0'
                }}>
                  Enterprise Package
                </h3>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px',
                  margin: '0 0 16px 0'
                }}>
                  R5,999.00 for 6 months
                </p>
                <button style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%'
                }}>
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default Billing;