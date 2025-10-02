import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LearnerLayout from "@/components/LearnerLayout";

interface Tutor {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  qualifications: string;
  experience: number;
  hourlyRate: number;
  status: 'active' | 'inactive' | 'pending_verification' | 'suspended';
  rating: number;
  totalSessions: number;
  joinDate: string;
  lastActive: string;
  bio: string;
  profileImage?: string;
}

const AdminTutorManagement = () => {
  const { isAuthenticated } = useAuth();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadTutors = async () => {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockTutors: Tutor[] = [
        {
          id: "1",
          name: "Dr. Sarah Johnson",
          email: "sarah.johnson@email.com",
          phone: "+27 82 123 4567",
          subjects: ["Mathematics", "Physics", "Chemistry"],
          qualifications: "PhD in Mathematics, MSc in Physics",
          experience: 8,
          hourlyRate: 450,
          status: 'active',
          rating: 4.9,
          totalSessions: 156,
          joinDate: "2023-01-15",
          lastActive: "2024-01-15T10:30:00Z",
          bio: "Experienced mathematics and physics tutor with 8 years of teaching experience at university level."
        },
        {
          id: "2",
          name: "Prof. Mike Wilson",
          email: "mike.wilson@email.com",
          phone: "+27 83 234 5678",
          subjects: ["Biology", "Chemistry"],
          qualifications: "PhD in Biochemistry, BSc Hons",
          experience: 12,
          hourlyRate: 500,
          status: 'active',
          rating: 4.8,
          totalSessions: 203,
          joinDate: "2022-08-20",
          lastActive: "2024-01-15T09:15:00Z",
          bio: "Senior lecturer in Biochemistry with extensive research and teaching experience."
        },
        {
          id: "3",
          name: "Dr. Emily Davis",
          email: "emily.davis@email.com",
          phone: "+27 84 345 6789",
          subjects: ["English Literature", "History"],
          qualifications: "PhD in English Literature, MA in History",
          experience: 6,
          hourlyRate: 380,
          status: 'pending_verification',
          rating: 0,
          totalSessions: 0,
          joinDate: "2024-01-10",
          lastActive: "2024-01-10T14:20:00Z",
          bio: "Recent PhD graduate specializing in English literature and historical analysis."
        },
        {
          id: "4",
          name: "Mr. James Brown",
          email: "james.brown@email.com",
          phone: "+27 85 456 7890",
          subjects: ["Computer Science", "Programming"],
          qualifications: "MSc in Computer Science, BSc in Software Engineering",
          experience: 5,
          hourlyRate: 420,
          status: 'inactive',
          rating: 4.7,
          totalSessions: 89,
          joinDate: "2023-06-12",
          lastActive: "2024-01-05T16:45:00Z",
          bio: "Software engineer with 5 years of industry experience and strong teaching skills."
        },
        {
          id: "5",
          name: "Dr. Lisa Martinez",
          email: "lisa.martinez@email.com",
          phone: "+27 86 567 8901",
          subjects: ["Spanish", "French"],
          qualifications: "PhD in Linguistics, MA in Modern Languages",
          experience: 10,
          hourlyRate: 400,
          status: 'suspended',
          rating: 4.6,
          totalSessions: 134,
          joinDate: "2022-03-08",
          lastActive: "2024-01-12T11:30:00Z",
          bio: "Native Spanish speaker with extensive experience teaching foreign languages."
        }
      ];

      setTutors(mockTutors);
      setLoading(false);
    };

    loadTutors();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#dcfce7', text: '#166534', border: '#22c55e' };
      case 'inactive':
        return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
      case 'pending_verification':
        return { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' };
      case 'suspended':
        return { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#9ca3af' };
    }
  };

  const filteredTutors = tutors.filter(tutor => {
    const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutor.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || tutor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (tutorId: string, newStatus: string) => {
    setTutors(tutors.map(tutor => 
      tutor.id === tutorId ? { ...tutor, status: newStatus as any } : tutor
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLastActive = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return formatDate(timestamp);
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
              Loading tutors...
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
              Tutor Management
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '18px'
            }}>
              Manage tutors, verify qualifications, and monitor performance
            </p>
          </div>

          {/* Filters and Search */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '16px',
              alignItems: 'end'
            }}>
              <div>
                <label style={{ 
                  display: 'block',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Search Tutors
                </label>
                <input
                  type="text"
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
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
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minWidth: '150px'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending_verification">Pending Verification</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tutors Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ 
                color: '#111827', 
                fontSize: '20px', 
                fontWeight: '600',
                margin: 0
              }}>
                Tutors ({filteredTutors.length})
              </h2>
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Add New Tutor
              </button>
            </div>

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
                      Tutor
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Subjects
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Rate
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Rating
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Sessions
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTutors.map((tutor) => {
                    const statusColor = getStatusColor(tutor.status);
                    
                    return (
                      <tr key={tutor.id} style={{ 
                        borderBottom: '1px solid #f3f4f6'
                      }}>
                        <td style={{ 
                          padding: '16px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#3b82f6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}>
                              {tutor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <p style={{ 
                                color: '#111827', 
                                fontSize: '14px', 
                                fontWeight: '600',
                                margin: '0 0 2px 0'
                              }}>
                                {tutor.name}
                              </p>
                              <p style={{ 
                                color: '#6b7280', 
                                fontSize: '12px',
                                margin: 0
                              }}>
                                {tutor.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '16px',
                          color: '#374151',
                          fontSize: '14px'
                        }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {tutor.subjects.map((subject, index) => (
                              <span key={index} style={{
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}>
                                {subject}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '16px',
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          R{tutor.hourlyRate}/hr
                        </td>
                        <td style={{ 
                          padding: '16px'
                        }}>
                          {tutor.rating > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#f59e0b' }}>⭐</span>
                              <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                                {tutor.rating}
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: '#9ca3af', fontSize: '14px' }}>No rating</span>
                          )}
                        </td>
                        <td style={{ 
                          padding: '16px',
                          color: '#374151',
                          fontSize: '14px'
                        }}>
                          {tutor.totalSessions}
                        </td>
                        <td style={{ 
                          padding: '16px'
                        }}>
                          <select
                            value={tutor.status}
                            onChange={(e) => handleStatusChange(tutor.id, e.target.value)}
                            style={{
                              backgroundColor: statusColor.bg,
                              color: statusColor.text,
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending_verification">Pending</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                        <td style={{ 
                          padding: '16px'
                        }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setSelectedTutor(tutor);
                                setShowModal(true);
                              }}
                              style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: '6px 12px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              View
                            </button>
                            <button style={{
                              backgroundColor: '#10b981',
                              color: 'white',
                              padding: '6px 12px',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}>
                              Edit
                            </button>
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
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tutor Details Modal */}
          {showModal && selectedTutor && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '32px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <h2 style={{ 
                    color: '#111827', 
                    fontSize: '24px', 
                    fontWeight: '600',
                    margin: 0
                  }}>
                    Tutor Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: '#6b7280'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '24px'
                }}>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Name
                    </h3>
                    <p style={{ color: '#111827', fontSize: '16px', margin: 0 }}>
                      {selectedTutor.name}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Email
                    </h3>
                    <p style={{ color: '#111827', fontSize: '16px', margin: 0 }}>
                      {selectedTutor.email}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Phone
                    </h3>
                    <p style={{ color: '#111827', fontSize: '16px', margin: 0 }}>
                      {selectedTutor.phone}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Hourly Rate
                    </h3>
                    <p style={{ color: '#111827', fontSize: '16px', margin: 0 }}>
                      R{selectedTutor.hourlyRate}/hour
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Subjects
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedTutor.subjects.map((subject, index) => (
                      <span key={index} style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Qualifications
                  </h3>
                  <p style={{ color: '#111827', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                    {selectedTutor.qualifications}
                  </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Bio
                  </h3>
                  <p style={{ color: '#111827', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                    {selectedTutor.bio}
                  </p>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px'
                }}>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Experience
                    </h3>
                    <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                      {selectedTutor.experience} years
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Total Sessions
                    </h3>
                    <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                      {selectedTutor.totalSessions}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Join Date
                    </h3>
                    <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                      {formatDate(selectedTutor.joinDate)}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Last Active
                    </h3>
                    <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                      {formatLastActive(selectedTutor.lastActive)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LearnerLayout>
  );
};

export default AdminTutorManagement;
