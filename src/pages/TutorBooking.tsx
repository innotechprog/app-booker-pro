import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Star, Clock, MapPin, ArrowLeft, Calendar, BookOpen, Video, Users } from "lucide-react";
import { toast } from "sonner";
import { tutorsAPI, bookingsAPI } from "@/services/api";

interface Tutor {
  id: string;
  name: string;
  subject: string;
  grade: string;
  rating: number;
  reviews: number;
  experience: string;
  students: number;
  rate: number;
  bio: string;
  specializations: string[];
  availability: string[];
}

const TutorBooking = () => {
  const { tutorId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    subject: '',
    date: '',
    time: '',
    duration: '1',
    sessionType: 'online',
    notes: ''
  });
  const [availableSubjects] = useState(['Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Biology', 'Computer Science', 'Economics']);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/learner/login');
      return;
    }

    const fetchTutor = async () => {
      if (!tutorId) {
        setLoading(false);
        toast.error("Invalid tutor");
        navigate('/learner/dashboard');
        return;
      }
      try {
        const res = await tutorsAPI.getById(tutorId);
        if (res.success && res.tutor) {
          const t = res.tutor;
          setTutor({
            id: String(t.id),
            name: t.name,
            subject: t.subject || '',
            grade: t.grade || 'Grade 10-12',
            rating: t.rating || 0,
            reviews: t.reviews || 0,
            experience: t.experience || '',
            students: t.students || 0,
            rate: t.rate || 0,
            bio: t.bio || '',
            specializations: t.specializations || [],
            availability: t.availability || []
          });
          const subjectFromUrl = searchParams.get('subject');
          setBookingData(prev => ({ ...prev, subject: subjectFromUrl || t.subject || '' }));
        } else {
          toast.error("Tutor not found");
          navigate('/learner/dashboard');
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load tutor");
        navigate('/learner/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchTutor();
  }, [tutorId, isAuthenticated, navigate, searchParams]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.date || !bookingData.time) {
      toast.error("Please select date and time for the session");
      return;
    }

    if (!tutor) return;

    setProcessing(true);
    try {
      const res = await bookingsAPI.create({
        tutorId: tutor.id,
        subject: bookingData.subject || undefined,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        sessionType: bookingData.sessionType || undefined,
        notes: bookingData.notes || undefined
      });

      if (res.success) {
        toast.success("Tutoring session booked successfully! You will receive a confirmation email shortly.");
        navigate('/learner/dashboard');
      } else {
        throw new Error(res.message || "Booking failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to book session");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
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
              Loading tutor details...
            </h2>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!tutor) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#dc2626', fontSize: '18px', fontWeight: '600' }}>
              Tutor not found
            </h2>
            <button
              onClick={() => navigate('/learner/dashboard')}
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
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto'
        }}>
          {/* Header */}
          <div style={{ 
            marginBottom: '32px',
            padding: '20px 0'
          }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/learner/dashboard')}
              style={{
                marginBottom: '16px',
                color: '#6b7280',
                padding: '8px 16px'
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 style={{ 
              color: '#111827', 
              fontSize: '32px', 
              fontWeight: '700', 
              marginBottom: '8px'
            }}>
              Book Tutoring Session
            </h1>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '16px'
            }}>
              Schedule a session with {tutor.name}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '32px'
          }}>
            {/* Booking Form */}
            <div>
              <Card style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}>
                <CardHeader style={{ padding: '0 0 20px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <CardTitle style={{ 
                    color: '#111827', 
                    fontSize: '20px', 
                    fontWeight: '600'
                  }}>
                    Session Details
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '20px 0 0 0' }}>
                  <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <Label htmlFor="subject" style={{ 
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Subject
                      </Label>
                      <Select value={bookingData.subject} onValueChange={(value) => setBookingData({...bookingData, subject: value})}>
                        <SelectTrigger style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: 'white'
                        }}>
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div>
                        <Label htmlFor="date" style={{ 
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          marginBottom: '8px',
                          display: 'block'
                        }}>
                          Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="time" style={{ 
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          marginBottom: '8px',
                          display: 'block'
                        }}>
                          Time
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={bookingData.time}
                          onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
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

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div>
                        <Label htmlFor="duration" style={{ 
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          marginBottom: '8px',
                          display: 'block'
                        }}>
                          Duration
                        </Label>
                        <Select value={bookingData.duration} onValueChange={(value) => setBookingData({...bookingData, duration: value})}>
                          <SelectTrigger style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 hour</SelectItem>
                            <SelectItem value="1.5">1.5 hours</SelectItem>
                            <SelectItem value="2">2 hours</SelectItem>
                            <SelectItem value="3">3 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="sessionType" style={{ 
                          color: '#374151',
                          fontSize: '14px',
                          fontWeight: '500',
                          marginBottom: '8px',
                          display: 'block'
                        }}>
                          Session Type
                        </Label>
                        <Select value={bookingData.sessionType} onValueChange={(value) => setBookingData({...bookingData, sessionType: value})}>
                          <SelectTrigger style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            backgroundColor: 'white'
                          }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="in-person">In-Person</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes" style={{ 
                        color: '#374151',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px',
                        display: 'block'
                      }}>
                        Additional Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                        className="text-gray-900 bg-white placeholder:text-gray-500"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '14px',
                          minHeight: '100px',
                          resize: 'none'
                        }}
                        placeholder="Any specific topics or questions you'd like to focus on..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={processing}
                      style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: processing ? '#9ca3af' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: processing ? 'not-allowed' : 'pointer',
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
                          Booking Session...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-5 w-5" />
                          Book Session
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Tutor Info & Pricing */}
            <div>
              <Card style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                position: 'sticky',
                top: '20px'
              }}>
                <CardHeader style={{ padding: '0 0 20px 0', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 style={{ 
                        color: '#111827', 
                        fontSize: '20px', 
                        fontWeight: '600',
                        margin: '0 0 4px 0'
                      }}>
                        {tutor.name}
                      </h3>
                      <p style={{ 
                        color: '#6b7280', 
                        fontSize: '14px',
                        margin: '0 0 8px 0'
                      }}>
                        {tutor.subject} • {tutor.grade}
                      </p>
                      {bookingData.subject && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            color: '#059669', 
                            fontSize: '12px', 
                            fontWeight: '600',
                            backgroundColor: '#d1fae5',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #a7f3d0'
                          }}>
                            📚 {bookingData.subject}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span style={{ color: '#374151', fontSize: '14px', fontWeight: '500' }}>
                      {tutor.rating} ({tutor.reviews} reviews)
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{tutor.experience}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users className="h-4 w-4 text-green-600" />
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{tutor.students}+ students</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent style={{ padding: '20px 0 0 0' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ 
                      color: '#111827', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>
                      About
                    </h4>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '14px',
                      lineHeight: '1.5',
                      margin: '0 0 12px 0'
                    }}>
                      {tutor.bio}
                    </p>
                    
                    <div>
                      <h5 style={{ 
                        color: '#374151', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        marginBottom: '6px'
                      }}>
                        Specializations:
                      </h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {tutor.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary" style={{ fontSize: '11px' }}>
                            {spec}
                          </Badge>
                        ))}
                      </div>
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
                        Hourly Rate
                      </span>
                      <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                        R{tutor.rate}/hour
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        Duration
                      </span>
                      <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                        {bookingData.duration} hour(s)
                      </span>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #e5e7eb',
                      paddingTop: '12px',
                      marginTop: '12px'
                    }}>
                      <span style={{ color: '#111827', fontSize: '18px', fontWeight: '600' }}>
                        Total Cost
                      </span>
                      <span style={{ color: '#111827', fontSize: '24px', fontWeight: '700' }}>
                        R{(parseFloat(bookingData.duration) * tutor.rate).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span style={{ color: '#0369a1', fontSize: '12px', fontWeight: '600' }}>
                        Available Days
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {tutor.availability.map((day, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-gray-800 border-gray-400 bg-white hover:bg-gray-50"
                          style={{ fontSize: '10px' }}
                        >
                          {day}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TutorBooking;
