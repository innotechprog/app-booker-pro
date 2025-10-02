import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LearnerLayout from "@/components/LearnerLayout";

interface DashboardStats {
  totalTutors: number;
  activeTutors: number;
  totalStudents: number;
  activeStudents: number;
  totalSessions: number;
  pendingSessions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

interface RecentActivity {
  id: string;
  type: 'tutor_registration' | 'student_registration' | 'session_completed' | 'payment_received';
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning' | 'error';
}

const AdminEducationalDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTutors: 0,
    activeTutors: 0,
    totalStudents: 0,
    activeStudents: 0,
    totalSessions: 0,
    pendingSessions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockStats: DashboardStats = {
        totalTutors: 45,
        activeTutors: 38,
        totalStudents: 234,
        activeStudents: 189,
        totalSessions: 1247,
        pendingSessions: 23,
        totalRevenue: 156789.50,
        monthlyRevenue: 23456.75
      };

      const mockActivity: RecentActivity[] = [
        {
          id: "1",
          type: 'tutor_registration',
          description: 'Dr. Sarah Johnson registered as a Mathematics tutor',
          timestamp: '2024-01-15T10:30:00Z',
          status: 'success'
        },
        {
          id: "2",
          type: 'session_completed',
          description: 'Physics tutoring session completed by Prof. Mike Wilson',
          timestamp: '2024-01-15T09:15:00Z',
          status: 'success'
        },
        {
          id: "3",
          type: 'payment_received',
          description: 'Payment of R2,999 received from student John Doe',
          timestamp: '2024-01-15T08:45:00Z',
          status: 'success'
        },
        {
          id: "4",
          type: 'student_registration',
          description: 'New student registration requires verification',
          timestamp: '2024-01-15T07:20:00Z',
          status: 'pending'
        },
        {
          id: "5",
          type: 'session_completed',
          description: 'Chemistry session cancelled - tutor unavailable',
          timestamp: '2024-01-14T16:30:00Z',
          status: 'warning'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tutor_registration':
        return '👨‍🏫';
      case 'student_registration':
        return '👨‍🎓';
      case 'session_completed':
        return '✅';
      case 'payment_received':
        return '💰';
      default:
        return '📝';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return { bg: '#dcfce7', text: '#166534', border: '#22c55e' };
      case 'pending':
        return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'warning':
        return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'error':
        return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return date.toLocaleDateString('en-ZA');
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
              Loading admin dashboard...
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
          maxWidth: '1400px', 
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{ 
            marginBottom: '32px',
            padding: '20px 0'
          }}>
            <h1 style={{ 
              color: '#111827', 
              fontSize: '36px', 
              fontWeight: '700', 
              marginBottom: '8px'
            }}>
              Educational Administration
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '18px'
            }}>
              Manage tutors, students, sessions, and educational processes
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <button style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '16px 20px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>👨‍🏫</span>
              Manage Tutors
            </button>
            <button style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '16px 20px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>👨‍🎓</span>
              Manage Students
            </button>
            <button style={{
              backgroundColor: '#f59e0b',
              color: 'white',
              padding: '16px 20px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>📅</span>
              Manage Sessions
            </button>
            <button style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              padding: '16px 20px',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>📊</span>
              View Reports
            </button>
          </div>

          {/* Stats Overview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>👨‍🏫</div>
                <div>
                  <h3 style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    Total Tutors
                  </h3>
                  <p style={{ color: '#111827', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                    {stats.totalTutors}
                  </p>
                </div>
              </div>
              <p style={{ color: '#10b981', fontSize: '12px', fontWeight: '600', margin: 0 }}>
                {stats.activeTutors} active
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>👨‍🎓</div>
                <div>
                  <h3 style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    Total Students
                  </h3>
                  <p style={{ color: '#111827', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                    {stats.totalStudents}
                  </p>
                </div>
              </div>
              <p style={{ color: '#10b981', fontSize: '12px', fontWeight: '600', margin: 0 }}>
                {stats.activeStudents} active
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>📚</div>
                <div>
                  <h3 style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    Total Sessions
                  </h3>
                  <p style={{ color: '#111827', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                    {stats.totalSessions}
                  </p>
                </div>
              </div>
              <p style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600', margin: 0 }}>
                {stats.pendingSessions} pending
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '32px' }}>💰</div>
                <div>
                  <h3 style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500', margin: 0 }}>
                    Monthly Revenue
                  </h3>
                  <p style={{ color: '#111827', fontSize: '28px', fontWeight: '700', margin: 0 }}>
                    R{stats.monthlyRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <p style={{ color: '#10b981', fontSize: '12px', fontWeight: '600', margin: 0 }}>
                R{stats.totalRevenue.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              color: '#111827', 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '20px'
            }}>
              Recent Activity
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map((activity) => {
                const statusColor = getStatusColor(activity.status);
                
                return (
                  <div key={activity.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: `1px solid ${statusColor.border}`
                  }}>
                    <div style={{ fontSize: '24px' }}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        color: '#111827', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        margin: '0 0 4px 0'
                      }}>
                        {activity.description}
                      </p>
                      <p style={{ 
                        color: '#6b7280', 
                        fontSize: '12px',
                        margin: 0
                      }}>
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: statusColor.bg,
                      color: statusColor.text,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {activity.status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default AdminEducationalDashboard;
