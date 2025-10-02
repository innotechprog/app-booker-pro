import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LearnerLayout from "@/components/LearnerLayout";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  subjects: string[];
  package: string;
  packageExpiry?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  joinDate: string;
  lastActive: string;
  totalSessions: number;
  totalSpent: number;
  preferredTutors: string[];
  parentContact?: string;
  notes?: string;
}

const AdminStudentManagement = () => {
  const { isAuthenticated } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockStudents: Student[] = [
        {
          id: "1",
          name: "John Doe",
          email: "john.doe@email.com",
          phone: "+27 82 123 4567",
          grade: "Grade 12",
          subjects: ["Mathematics", "Physics"],
          package: "Premium Package",
          packageExpiry: "2024-04-15",
          status: 'active',
          joinDate: "2024-01-15",
          lastActive: "2024-01-15T10:30:00Z",
          totalSessions: 12,
          totalSpent: 3598.80,
          preferredTutors: ["Dr. Sarah Johnson", "Prof. Mike Wilson"],
          parentContact: "+27 83 123 4567",
          notes: "Excellent student, very motivated"
        },
        {
          id: "2",
          name: "Jane Smith",
          email: "jane.smith@email.com",
          phone: "+27 83 234 5678",
          grade: "Grade 11",
          subjects: ["English Literature", "History"],
          package: "Free Package",
          status: 'active',
          joinDate: "2024-01-10",
          lastActive: "2024-01-15T09:15:00Z",
          totalSessions: 3,
          totalSpent: 0,
          preferredTutors: ["Dr. Emily Davis"]
        },
        {
          id: "3",
          name: "Michael Brown",
          email: "michael.brown@email.com",
          phone: "+27 84 345 6789",
          grade: "Grade 10",
          subjects: ["Computer Science", "Mathematics"],
          package: "Enterprise Package",
          packageExpiry: "2024-09-01",
          status: 'active',
          joinDate: "2024-01-08",
          lastActive: "2024-01-15T08:45:00Z",
          totalSessions: 8,
          totalSpent: 5999.00,
          preferredTutors: ["Mr. James Brown"],
          parentContact: "+27 85 345 6789"
        },
        {
          id: "4",
          name: "Sarah Wilson",
          email: "sarah.wilson@email.com",
          phone: "+27 85 456 7890",
          grade: "Grade 9",
          subjects: ["Biology", "Chemistry"],
          package: "Premium Package",
          packageExpiry: "2024-03-20",
          status: 'pending_verification',
          joinDate: "2024-01-12",
          lastActive: "2024-01-12T14:20:00Z",
          totalSessions: 0,
          totalSpent: 0,
          preferredTutors: [],
          parentContact: "+27 86 456 7890",
          notes: "Parent verification pending"
        },
        {
          id: "5",
          name: "David Johnson",
          email: "david.johnson@email.com",
          phone: "+27 86 567 8901",
          grade: "Grade 12",
          subjects: ["Spanish", "French"],
          package: "Premium Package",
          packageExpiry: "2024-02-28",
          status: 'suspended',
          joinDate: "2023-12-15",
          lastActive: "2024-01-10T11:30:00Z",
          totalSessions: 15,
          totalSpent: 4498.50,
          preferredTutors: ["Dr. Lisa Martinez"],
          notes: "Suspended due to payment issues"
        }
      ];

      setStudents(mockStudents);
      setLoading(false);
    };

    loadStudents();
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

  const getPackageColor = (packageName: string) => {
    switch (packageName) {
      case 'Enterprise Package':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'Premium Package':
        return { bg: '#f3e8ff', text: '#7c2d12' };
      case 'Free Package':
        return { bg: '#dcfce7', text: '#166534' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesPackage = packageFilter === 'all' || student.package === packageFilter;
    return matchesSearch && matchesStatus && matchesPackage;
  });

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, status: newStatus as any } : student
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

  const isPackageExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
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
              Loading students...
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
              Student Management
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '18px'
            }}>
              Manage students, track progress, and monitor package usage
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
              gridTemplateColumns: '1fr auto auto',
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
                  Search Students
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
                  Status
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
                  <option value="pending_verification">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  color: '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Package
                </label>
                <select
                  value={packageFilter}
                  onChange={(e) => setPackageFilter(e.target.value)}
                  style={{
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    minWidth: '150px'
                  }}
                >
                  <option value="all">All Packages</option>
                  <option value="Free Package">Free Package</option>
                  <option value="Premium Package">Premium Package</option>
                  <option value="Enterprise Package">Enterprise Package</option>
                </select>
              </div>
            </div>
          </div>

          {/* Students Table */}
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
                Students ({filteredStudents.length})
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
                Add New Student
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
                      Student
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Grade
                    </th>
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
                      Sessions
                    </th>
                    <th style={{ 
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: '#374151',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Spent
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
                  {filteredStudents.map((student) => {
                    const statusColor = getStatusColor(student.status);
                    const packageColor = getPackageColor(student.package);
                    const packageExpired = isPackageExpired(student.packageExpiry);
                    
                    return (
                      <tr key={student.id} style={{ 
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
                              backgroundColor: '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '16px',
                              fontWeight: '600'
                            }}>
                              {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                            <div>
                              <p style={{ 
                                color: '#111827', 
                                fontSize: '14px', 
                                fontWeight: '600',
                                margin: '0 0 2px 0'
                              }}>
                                {student.name}
                              </p>
                              <p style={{ 
                                color: '#6b7280', 
                                fontSize: '12px',
                                margin: 0
                              }}>
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ 
                          padding: '16px',
                          color: '#374151',
                          fontSize: '14px'
                        }}>
                          {student.grade}
                        </td>
                        <td style={{ 
                          padding: '16px'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{
                              backgroundColor: packageColor.bg,
                              color: packageColor.text,
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              display: 'inline-block'
                            }}>
                              {student.package}
                            </span>
                            {student.packageExpiry && (
                              <span style={{
                                color: packageExpired ? '#dc2626' : '#6b7280',
                                fontSize: '11px'
                              }}>
                                {packageExpired ? 'Expired' : `Expires ${formatDate(student.packageExpiry)}`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ 
                          padding: '16px',
                          color: '#374151',
                          fontSize: '14px'
                        }}>
                          {student.totalSessions}
                        </td>
                        <td style={{ 
                          padding: '16px',
                          color: '#111827',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          R{student.totalSpent.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ 
                          padding: '16px'
                        }}>
                          <select
                            value={student.status}
                            onChange={(e) => handleStatusChange(student.id, e.target.value)}
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
                                setSelectedStudent(student);
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

          {/* Student Details Modal */}
          {showModal && selectedStudent && (
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
                    Student Details
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
                      {selectedStudent.name}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Email
                    </h3>
                    <p style={{ color: '#111827', fontSize: '16px', margin: 0 }}>
                      {selectedStudent.email}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Phone
                    </h3>
                    <p style={{ color: '#111827', fontSize: '16px', margin: 0 }}>
                      {selectedStudent.phone}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Grade
                    </h3>
                    <p style={{ color: '#111827', fontSize: '16px', margin: 0 }}>
                      {selectedStudent.grade}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                    Subjects
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {selectedStudent.subjects.map((subject, index) => (
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
                    Package Information
                  </h3>
                  <div style={{
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    padding: '16px'
                  }}>
                    <p style={{ color: '#111827', fontSize: '16px', fontWeight: '600', margin: '0 0 8px 0' }}>
                      {selectedStudent.package}
                    </p>
                    {selectedStudent.packageExpiry && (
                      <p style={{ 
                        color: isPackageExpired(selectedStudent.packageExpiry) ? '#dc2626' : '#6b7280', 
                        fontSize: '14px',
                        margin: 0
                      }}>
                        {isPackageExpired(selectedStudent.packageExpiry) ? 'Expired' : `Expires: ${formatDate(selectedStudent.packageExpiry)}`}
                      </p>
                    )}
                  </div>
                </div>

                {selectedStudent.parentContact && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Parent Contact
                    </h3>
                    <p style={{ color: '#111827', fontSize: '16px', margin: 0 }}>
                      {selectedStudent.parentContact}
                    </p>
                  </div>
                )}

                {selectedStudent.notes && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Notes
                    </h3>
                    <p style={{ color: '#111827', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                      {selectedStudent.notes}
                    </p>
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px'
                }}>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Total Sessions
                    </h3>
                    <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                      {selectedStudent.totalSessions}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Total Spent
                    </h3>
                    <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                      R{selectedStudent.totalSpent.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Join Date
                    </h3>
                    <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                      {formatDate(selectedStudent.joinDate)}
                    </p>
                  </div>
                  <div>
                    <h3 style={{ color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                      Last Active
                    </h3>
                    <p style={{ color: '#111827', fontSize: '14px', margin: 0 }}>
                      {formatLastActive(selectedStudent.lastActive)}
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

export default AdminStudentManagement;
