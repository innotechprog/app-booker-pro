import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LearnerLayout from "@/components/LearnerLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  BookOpen, 
  Star, 
  Clock, 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  CheckCircle,
  Edit,
  Settings,
  GraduationCap,
  BookMarked,
  MessageSquare,
  Play,
  Eye,
  Save,
  X,
  Heart,
  Send,
  BarChart3,
  PieChart,
  Bell,
  Plus,
  Trash2
} from "lucide-react";
import { getPersonalizedTutorials, TutorialItem } from "@/data/tutorials";
import AvailableTutorials from "./AvailableTutorials";

interface LearnerDashboardProps {
  initialTab?: "profile" | "tutorials" | "tutors" | "notes" | "achievements" | "analytics";
  hideTabs?: boolean;
  showProfileForm?: boolean;
}

const LearnerDashboard = ({ initialTab = "profile", hideTabs = false, showProfileForm = false }: LearnerDashboardProps) => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Notes
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [noteCategory, setNoteCategory] = useState("general");
  const [notes, setNotes] = useState<any[]>([]);
  const [notesFilter, setNotesFilter] = useState("all");
  const notesPreview = useMemo(()=> noteBody, [noteBody]);

  // Study Streak & Achievements
  const [studyStreak, setStudyStreak] = useState(0);
  const [totalBadges, setTotalBadges] = useState(0);
  const [bookmarkedTutorials, setBookmarkedTutorials] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  // Messages
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");

  // Calendar & Notifications
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventType, setNewEventType] = useState("study");

  // Subject Management
  const [newSubject, setNewSubject] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: any) => {
    if (!profile) return 0;
    const fields = ['name', 'email', 'grade', 'subjects', 'goals'];
    const completedFields = fields.filter(field => {
      if (field === 'subjects') return profile[field] && profile[field].length > 0;
      return profile[field] && profile[field].trim() !== '';
    });
    return Math.round((completedFields.length / fields.length) * 100);
  };

  useEffect(()=>{
    const c = localStorage.getItem("learner_current");
    if (!c) { navigate("/learner/login"); return; }
    const { email } = JSON.parse(c);
    setCurrent({ email });
    const learners = JSON.parse(localStorage.getItem("learners") || "[]");
    const p = learners.find((l: any)=> l.email === email);
    setProfile(p);
    setProfileCompletion(calculateProfileCompletion(p));
    const ns = JSON.parse(localStorage.getItem(`notes_${email}`) || "[]");
    setNotes(ns);
    
    // Load study streak
    const streakData = JSON.parse(localStorage.getItem(`streak_${email}`) || '{"streak": 0, "lastLogin": ""}');
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (streakData.lastLogin === today) {
      setStudyStreak(streakData.streak);
    } else if (streakData.lastLogin === yesterday) {
      const newStreak = streakData.streak + 1;
      setStudyStreak(newStreak);
      localStorage.setItem(`streak_${email}`, JSON.stringify({ streak: newStreak, lastLogin: today }));
    } else {
      setStudyStreak(1);
      localStorage.setItem(`streak_${email}`, JSON.stringify({ streak: 1, lastLogin: today }));
    }
    
    // Load bookmarks and achievements
    const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${email}`) || "[]");
    setBookmarkedTutorials(bookmarks);
    
    const userAchievements = JSON.parse(localStorage.getItem(`achievements_${email}`) || "[]");
    setAchievements(userAchievements);
    setTotalBadges(userAchievements.length);

    // Load messages
    const userMessages = JSON.parse(localStorage.getItem(`messages_${email}`) || "[]");
    setMessages(userMessages);

    // Load calendar events
    const events = JSON.parse(localStorage.getItem(`calendar_${email}`) || "[]");
    setCalendarEvents(events);

    // Load notifications and add defaults
    const savedNotifications = JSON.parse(localStorage.getItem(`notifications_${email}`) || "[]");
    const defaultNotifications = [
      { id: Date.now() + 1, type: 'streak', message: `🔥 ${streakData.streak} day streak! Keep it up!`, time: new Date().toISOString(), read: false },
      { id: Date.now() + 2, type: 'achievement', message: '🎓 Welcome to the platform! Start learning today.', time: new Date().toISOString(), read: false }
    ];
    setNotifications(savedNotifications.length > 0 ? savedNotifications : defaultNotifications);
  }, [navigate]);

  const saveProfile = () => {
    if (!current) return;
    const learners = JSON.parse(localStorage.getItem("learners") || "[]");
    const idx = learners.findIndex((l: any)=> l.email === current.email);
    if (idx >= 0) { 
      learners[idx] = profile; 
      localStorage.setItem("learners", JSON.stringify(learners));
      setProfileCompletion(calculateProfileCompletion(profile));
      setIsEditing(false);
    }
  };

  const deleteProfile = () => {
    if (!current) return;
    const learners = JSON.parse(localStorage.getItem("learners") || "[]");
    const rest = learners.filter((l: any)=> l.email !== current.email);
    localStorage.setItem("learners", JSON.stringify(rest));
    localStorage.removeItem("learner_current");
    navigate("/learner/register");
  };

  const addNote = () => {
    if (!noteTitle.trim() && !noteBody.trim()) return;
    const next = [{ 
      id: Date.now(), 
      title: noteTitle || "Untitled", 
      body: noteBody,
      category: noteCategory,
      createdAt: new Date().toISOString()
    }, ...notes];
    setNotes(next);
    localStorage.setItem(`notes_${current.email}`, JSON.stringify(next));
    setNoteTitle(""); 
    setNoteBody("");
    setNoteCategory("general");
  };

  const deleteNote = (id: number) => {
    const next = notes.filter(n=> n.id !== id);
    setNotes(next);
    localStorage.setItem(`notes_${current.email}`, JSON.stringify(next));
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedTutor) return;
    const message = {
      id: Date.now(),
      tutorId: selectedTutor.id,
      tutorName: selectedTutor.name,
      content: newMessage,
      from: 'student',
      timestamp: new Date().toISOString()
    };
    const updated = [...messages, message];
    setMessages(updated);
    if (current?.email) {
      localStorage.setItem(`messages_${current.email}`, JSON.stringify(updated));
    }
    setNewMessage("");
  };

  const addCalendarEvent = () => {
    if (!newEventTitle.trim() || !newEventDate || !newEventTime) return;
    const event = {
      id: Date.now(),
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime,
      type: newEventType,
      completed: false
    };
    const updated = [...calendarEvents, event].sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());
    setCalendarEvents(updated);
    if (current?.email) {
      localStorage.setItem(`calendar_${current.email}`, JSON.stringify(updated));
      
      // Add notification
      const notification = {
        id: Date.now() + 1000,
        type: 'calendar',
        message: `📅 New event: ${newEventTitle} on ${new Date(newEventDate).toLocaleDateString()}`,
        time: new Date().toISOString(),
        read: false
      };
      const updatedNotifications = [notification, ...notifications];
      setNotifications(updatedNotifications);
      localStorage.setItem(`notifications_${current.email}`, JSON.stringify(updatedNotifications));
    }
    setNewEventTitle("");
    setNewEventDate("");
    setNewEventTime("");
    setNewEventType("study");
  };

  const deleteCalendarEvent = (id: number) => {
    const updated = calendarEvents.filter(e => e.id !== id);
    setCalendarEvents(updated);
    if (current?.email) {
      localStorage.setItem(`calendar_${current.email}`, JSON.stringify(updated));
    }
  };

  const toggleEventComplete = (id: number) => {
    const updated = calendarEvents.map(e => e.id === id ? {...e, completed: !e.completed} : e);
    setCalendarEvents(updated);
    if (current?.email) {
      localStorage.setItem(`calendar_${current.email}`, JSON.stringify(updated));
    }
  };

  const markNotificationRead = (id: number) => {
    const updated = notifications.map(n => n.id === id ? {...n, read: true} : n);
    setNotifications(updated);
    if (current?.email) {
      localStorage.setItem(`notifications_${current.email}`, JSON.stringify(updated));
    }
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (current?.email) {
      localStorage.setItem(`notifications_${current.email}`, JSON.stringify([]));
    }
  };

  const addSubject = () => {
    if (!newSubject.trim()) return;
    const currentSubjects = profile?.subjects || [];
    if (currentSubjects.includes(newSubject.trim())) {
      alert("This subject is already added!");
      return;
    }
    const updatedProfile = {
      ...profile,
      subjects: [...currentSubjects, newSubject.trim()]
    };
    setProfile(updatedProfile);
    
    // Save to localStorage
    if (current?.email) {
      const learners = JSON.parse(localStorage.getItem("learners") || "[]");
      const idx = learners.findIndex((l: any) => l.email === current.email);
      if (idx >= 0) {
        learners[idx] = updatedProfile;
        localStorage.setItem("learners", JSON.stringify(learners));
      }
    }
    
    setNewSubject("");
    setShowAddSubject(false);
    setProfileCompletion(calculateProfileCompletion(updatedProfile));
  };

  const removeSubject = (subject: string) => {
    const updatedProfile = {
      ...profile,
      subjects: (profile?.subjects || []).filter((s: string) => s !== subject)
    };
    setProfile(updatedProfile);
    
    // Save to localStorage
    if (current?.email) {
      const learners = JSON.parse(localStorage.getItem("learners") || "[]");
      const idx = learners.findIndex((l: any) => l.email === current.email);
      if (idx >= 0) {
        learners[idx] = updatedProfile;
        localStorage.setItem("learners", JSON.stringify(learners));
      }
    }
    
    setProfileCompletion(calculateProfileCompletion(updatedProfile));
  };

  // Get personalized tutorials based on user profile
  const tutorials = useMemo(() => {
    const grade = profile?.grade || "";
    const subjects = profile?.subjects || [];
    return getPersonalizedTutorials(grade, subjects).slice(0, 6); // Show first 6 recommendations
  }, [profile]);

  const tutors = useMemo(()=>{
    const g = profile?.grade || "";
    return [
      { id: 1, name: "Dr. Sarah Johnson", subject: "Mathematics", grade: g },
      { id: 2, name: "Prof. Michael Chen", subject: "Science", grade: g },
      { id: 3, name: "Ms. L. Dlamini", subject: "English", grade: g },
    ];
  }, [profile]);

  return (
    <LearnerLayout>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <SEO title="Learner Portal" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Notifications Panel - only on Dashboard (Profile tab) when not showing profile form */}
        {activeTab === "profile" && !showProfileForm && notifications.filter(n => !n.read).length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm mb-6">
          <CardHeader className="border-b border-yellow-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-6 w-6 text-yellow-600" />
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </div>
                <div>
                  <CardTitle className="text-gray-900">Notifications</CardTitle>
                  <p className="text-sm text-gray-600">
                    You have {notifications.filter(n => !n.read).length} unread notification{notifications.filter(n => !n.read).length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={clearAllNotifications} className="text-gray-600 hover:text-gray-900">
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {notifications.filter(n => !n.read).map(notification => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-100 hover:shadow-sm transition-shadow cursor-pointer"
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    {notification.type === 'streak' && '🔥'}
                    {notification.type === 'achievement' && '🎓'}
                    {notification.type === 'calendar' && '📅'}
                    {!notification.type && '📢'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.time).toLocaleString()}
                    </p>
                  </div>
                  <button 
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={(e) => { e.stopPropagation(); markNotificationRead(notification.id); }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {notifications.filter(n => !n.read).length > 5 && (
                <p className="text-xs text-center text-gray-500 py-2">
                  Showing all {notifications.filter(n => !n.read).length} notifications
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Welcome Header - only on Dashboard (Profile tab) when not showing profile form */}
        {activeTab === "profile" && !showProfileForm && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {(() => {
                    const name = profile?.fullName || profile?.name || 'Learner';
                    if (!name || name === "Learner") return "L";
                    const words = name.trim().split(/\s+/);
                    if (words.length === 1) {
                      return words[0].substring(0, 2).toUpperCase();
                    }
                    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
                  })()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {profile?.fullName || profile?.name || 'Learner'}! 👋
                </h1>
                <p className="text-blue-100">
                  Ready to continue your learning journey? Let's make today productive!
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200 mb-1">Profile Completion</div>
              <div className="text-2xl font-bold">{profileCompletion}%</div>
              <Progress value={profileCompletion} className="w-24 h-2 mt-2" />
            </div>
          </div>
        </div>
        )}

        {/* Quick Stats - only on Dashboard (Profile tab) when not showing profile form */}
        {activeTab === "profile" && !showProfileForm && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="text-center p-4 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Tutorials</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </Card>
          
          <Card className="text-center p-4 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Rating</h3>
            <p className="text-2xl font-bold text-green-600">4.8</p>
          </Card>
          
          <Card className="text-center p-4 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Study Hours</h3>
            <p className="text-2xl font-bold text-purple-600">24</p>
          </Card>
          
          <Card className="text-center p-4 bg-white hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Progress</h3>
            <p className="text-2xl font-bold text-orange-600">85%</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">🔥 Streak</h3>
            <p className="text-2xl font-bold text-yellow-600">{studyStreak}</p>
          </Card>
          
          <Card className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-700 text-sm">Badges</h3>
            <p className="text-2xl font-bold text-purple-600">{totalBadges}</p>
          </Card>
        </div>
        )}

        {/* Calendar Section - only on Dashboard (Profile tab) when not showing profile form */}
        {activeTab === "profile" && !showProfileForm && (
        <Card className="bg-white border-gray-200 shadow-sm mb-8">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center text-gray-900">
              <Calendar className="mr-2 h-5 w-5 text-green-600" />
              My Calendar
            </CardTitle>
            <p className="text-gray-600">Schedule and track your study sessions</p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Event Form */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3">Add New Event</h3>
                <div>
                  <Label htmlFor="eventTitle" className="text-sm text-gray-700">Title</Label>
                  <Input
                    id="eventTitle"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g., Math Tutorial Session"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="eventDate" className="text-sm text-gray-700">Date</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime" className="text-sm text-gray-700">Time</Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="eventType" className="text-sm text-gray-700">Type</Label>
                  <Select value={newEventType} onValueChange={setNewEventType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">📚 Study Session</SelectItem>
                      <SelectItem value="tutorial">🎓 Tutorial</SelectItem>
                      <SelectItem value="exam">📝 Exam/Test</SelectItem>
                      <SelectItem value="assignment">✍️ Assignment Due</SelectItem>
                      <SelectItem value="other">📌 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addCalendarEvent} className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>

              {/* Upcoming Events */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Upcoming Events ({calendarEvents.filter(e => !e.completed).length})</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {calendarEvents.filter(e => !e.completed).length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No upcoming events</p>
                    </div>
                  ) : (
                    calendarEvents.filter(e => !e.completed).map(event => (
                      <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={event.completed}
                          onChange={() => toggleEventComplete(event.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-600">
                              📅 {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="text-xs text-gray-600">
                              🕐 {event.time}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.type === 'study' && '📚 Study'}
                              {event.type === 'tutorial' && '🎓 Tutorial'}
                              {event.type === 'exam' && '📝 Exam'}
                              {event.type === 'assignment' && '✍️ Assignment'}
                              {event.type === 'other' && '📌 Other'}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCalendarEvent(event.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Quick actions removed in favor of header navigation */}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          {!hideTabs && (
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="tutors">Tutors</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="profile" className="mt-6">
            {!showProfileForm ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Your Profile</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Update your personal information, learning goals, and track your progress in one place.
                </p>
                <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Link to="/learner/profile">
                    <User className="mr-2 h-5 w-5" />
                    Go to Profile
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Profile Management Card */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center text-gray-900">
                          <User className="mr-2 h-5 w-5 text-blue-600" />
                          Profile Information
                        </CardTitle>
                        <CardDescription className="text-gray-600">Manage your account details and learning preferences</CardDescription>
                      </div>
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={saveProfile} className="bg-green-600 hover:bg-green-700">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                          <Button onClick={() => setIsEditing(false)} variant="outline">
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name</Label>
                        {isEditing ? (
                          <Input
                            id="fullName"
                            value={profile?.fullName || profile?.name || ''}
                            onChange={(e) => setProfile({...profile, fullName: e.target.value, name: e.target.value})}
                            placeholder="Enter your full name"
                            className="text-base"
                          />
                        ) : (
                          <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                            {profile?.fullName || profile?.name || 'Not set'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                        <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                          {profile?.email || 'Not set'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="grade" className="text-sm font-semibold text-gray-700">Grade Level</Label>
                        {isEditing ? (
                          <Select value={profile?.grade || ''} onValueChange={(v) => setProfile({...profile, grade: v})}>
                            <SelectTrigger className="text-base">
                              <SelectValue placeholder="Select your grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Grade 1">Grade 1</SelectItem>
                              <SelectItem value="Grade 2">Grade 2</SelectItem>
                              <SelectItem value="Grade 3">Grade 3</SelectItem>
                              <SelectItem value="Grade 4">Grade 4</SelectItem>
                              <SelectItem value="Grade 5">Grade 5</SelectItem>
                              <SelectItem value="Grade 6">Grade 6</SelectItem>
                              <SelectItem value="Grade 7">Grade 7</SelectItem>
                              <SelectItem value="Grade 8">Grade 8</SelectItem>
                              <SelectItem value="Grade 9">Grade 9</SelectItem>
                              <SelectItem value="Grade 10">Grade 10</SelectItem>
                              <SelectItem value="Grade 11">Grade 11</SelectItem>
                              <SelectItem value="Grade 12">Grade 12</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                            {profile?.grade || 'Not set'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                        {isEditing ? (
                          <Input
                            id="phone"
                            value={profile?.phone || ''}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            placeholder="Enter your phone number"
                            className="text-base"
                          />
                        ) : (
                          <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                            {profile?.phone || 'Not set'}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="subjects" className="text-sm font-semibold text-gray-700">Subjects of Interest</Label>
                        {isEditing && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddSubject(!showAddSubject)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Subject
                          </Button>
                        )}
                      </div>
                      
                      {isEditing && showAddSubject && (
                        <div className="flex gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <Input
                            value={newSubject}
                            onChange={(e) => setNewSubject(e.target.value)}
                            placeholder="Enter subject name"
                            className="flex-1"
                            onKeyPress={(e) => e.key === 'Enter' && addSubject()}
                          />
                          <Button onClick={addSubject} size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Add
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border border-gray-200 min-h-[60px]">
                        {(profile?.subjects || []).length === 0 ? (
                          <p className="text-gray-400 text-sm italic">
                            {isEditing ? 'Click "Add Subject" to add your subjects' : 'No subjects added yet. Click "Edit Profile" to add subjects.'}
                          </p>
                        ) : (
                          (profile?.subjects || []).map((subject: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className={`px-3 py-1 text-sm flex items-center gap-2 ${isEditing ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
                            >
                              📚 {subject}
                              {isEditing && (
                                <X
                                  className="h-3 w-3 cursor-pointer hover:text-red-600 transition-colors"
                                  onClick={() => removeSubject(subject)}
                                />
                              )}
                            </Badge>
                          ))
                        )}
                      </div>
                      {!isEditing && (profile?.subjects || []).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          💡 Tip: Click "Edit Profile" to add or remove subjects
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="goals" className="text-sm font-semibold text-gray-700">Learning Goals</Label>
                      {isEditing ? (
                        <Textarea
                          id="goals"
                          value={profile?.goals || ''}
                          onChange={(e) => setProfile({...profile, goals: e.target.value})}
                          placeholder="What are your learning objectives?"
                          rows={4}
                          className="text-base"
                        />
                      ) : (
                        <p className="text-gray-900 text-base font-medium bg-gray-50 px-4 py-3 rounded-md border border-gray-200 min-h-[100px]">
                          {profile?.goals || 'Not set'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Overview */}
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                      Learning Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                          <span className="text-sm font-medium text-gray-900">{profileCompletion}%</span>
                        </div>
                        <Progress value={profileCompletion} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-blue-600">12</p>
                          <p className="text-sm text-gray-600">Tutorials Completed</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <Star className="h-6 w-6 text-green-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-green-600">4.8</p>
                          <p className="text-sm text-gray-600">Average Rating</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-purple-600">24</p>
                          <p className="text-sm text-gray-600">Study Hours</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tutorials" className="mt-6">
            <div className="space-y-6">
              {/* Bookmarked Tutorials */}
              {bookmarkedTutorials.length > 0 && (
                <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-sm">
                  <CardHeader className="border-b border-pink-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <Heart className="mr-2 h-5 w-5 text-pink-600 fill-pink-600" />
                      My Favorites
                    </CardTitle>
                    <p className="text-gray-600">Your bookmarked tutorials for quick access</p>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {bookmarkedTutorials.map((id) => (
                        <div key={id} className="min-w-[200px] p-3 bg-white rounded-lg border border-pink-200">
                          <p className="text-sm font-medium text-gray-900">Tutorial #{id}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full mt-2 text-pink-600"
                            onClick={() => {
                              const newBookmarks = bookmarkedTutorials.filter(b => b !== id);
                              setBookmarkedTutorials(newBookmarks);
                              if (current?.email) {
                                localStorage.setItem(`bookmarks_${current.email}`, JSON.stringify(newBookmarks));
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* All Tutorials */}
              <div>
                <AvailableTutorials hideHeader />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tutors" className="mt-6">
            <div className="space-y-6">
              {/* Messages Section */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
                <CardHeader className="border-b border-blue-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                    Messages
                  </CardTitle>
                  <p className="text-gray-600">Chat with your tutors</p>
                </CardHeader>
                <CardContent className="pt-4">
                  {selectedTutor ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{selectedTutor.name}</p>
                            <p className="text-xs text-gray-600">{selectedTutor.subject}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTutor(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Messages */}
                      <div className="bg-white rounded-lg p-4 min-h-[200px] max-h-[300px] overflow-y-auto space-y-3">
                        {messages
                          .filter(m => m.tutorId === selectedTutor.id)
                          .map(msg => (
                            <div key={msg.id} className={`flex ${msg.from === 'student' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] p-3 rounded-lg ${
                                msg.from === 'student' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className={`text-xs mt-1 ${msg.from === 'student' ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        {messages.filter(m => m.tutorId === selectedTutor.id).length === 0 && (
                          <div className="text-center text-gray-400 py-8">
                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No messages yet. Start a conversation!</p>
                          </div>
                        )}
                      </div>

                      {/* Send Message */}
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1"
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Select a tutor below to start a conversation</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Tutors */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <User className="mr-2 h-5 w-5 text-blue-600" />
                    Available Tutors
                  </CardTitle>
                  <p className="text-gray-600">Expert tutors for your grade level ({profile?.grade || 'Not specified'})</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutors.map(t => (
                      <Card key={t.id} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="text-center pb-3 border-b border-gray-100">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <CardTitle className="text-lg">{t.name}</CardTitle>
                          <div className="flex items-center justify-center space-x-2">
                            <Badge variant="secondary">{t.subject}</Badge>
                            <Badge variant="outline">{t.grade}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="text-center">
                          <div className="flex items-center justify-center mb-3">
                            <div className="flex items-center text-yellow-500">
                              <Star className="h-4 w-4 fill-current" />
                              <Star className="h-4 w-4 fill-current" />
                              <Star className="h-4 w-4 fill-current" />
                              <Star className="h-4 w-4 fill-current" />
                              <Star className="h-4 w-4 fill-current" />
                            </div>
                            <span className="ml-2 text-sm text-gray-600">4.9 (127 reviews)</span>
                          </div>
                          <div className="space-y-2 text-sm text-gray-600 mb-4">
                            <div className="flex items-center justify-between">
                              <span>Experience</span>
                              <span className="font-medium">5+ years</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Students</span>
                              <span className="font-medium">500+</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Rate</span>
                              <span className="font-medium">R300/hour</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Button className="w-full" size="sm">
                              Book Session
                            </Button>
                            <Button 
                              variant="outline" 
                              className="w-full" 
                              size="sm"
                              onClick={() => setSelectedTutor(t)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* My Tutors */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Award className="mr-2 h-5 w-5 text-blue-600" />
                    My Tutors
                  </CardTitle>
                  <p className="text-gray-600">Tutors you've worked with</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>You haven't worked with any tutors yet.</p>
                    <p className="text-sm">Book your first session to get started!</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="space-y-6">
              {/* Study Streak Card */}
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm">
                <CardHeader className="border-b border-yellow-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Target className="mr-2 h-5 w-5 text-yellow-600" />
                    🔥 Study Streak
                  </CardTitle>
                  <p className="text-gray-600">Keep your momentum going!</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-yellow-600 mb-2">{studyStreak}</div>
                    <p className="text-lg text-gray-700 mb-4">day{studyStreak !== 1 ? 's' : ''} in a row!</p>
                    <div className="flex justify-center gap-2 mb-4">
                      {[...Array(Math.min(studyStreak, 7))].map((_, i) => (
                        <div key={i} className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          🔥
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {studyStreak >= 7 ? "Amazing! You're on fire! 🎉" : `Keep going! ${7 - studyStreak} more day${(7 - studyStreak) !== 1 ? 's' : ''} to reach 7-day streak!`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Badges & Achievements */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Award className="mr-2 h-5 w-5 text-purple-600" />
                    Badges & Achievements
                  </CardTitle>
                  <p className="text-gray-600">Unlock badges as you learn and grow</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* First Login Badge */}
                    <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                      <div className="text-4xl mb-2">🎓</div>
                      <p className="font-semibold text-sm text-gray-900">Welcome!</p>
                      <p className="text-xs text-gray-600">Joined the platform</p>
                    </div>

                    {/* Profile Complete */}
                    {profileCompletion >= 100 && (
                      <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                        <div className="text-4xl mb-2">✅</div>
                        <p className="font-semibold text-sm text-gray-900">Complete Profile</p>
                        <p className="text-xs text-gray-600">100% profile completion</p>
                      </div>
                    )}

                    {/* 3-Day Streak */}
                    {studyStreak >= 3 && (
                      <div className="text-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                        <div className="text-4xl mb-2">🔥</div>
                        <p className="font-semibold text-sm text-gray-900">On Fire!</p>
                        <p className="text-xs text-gray-600">3-day study streak</p>
                      </div>
                    )}

                    {/* 7-Day Streak */}
                    {studyStreak >= 7 && (
                      <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                        <div className="text-4xl mb-2">🏆</div>
                        <p className="font-semibold text-sm text-gray-900">Week Warrior</p>
                        <p className="text-xs text-gray-600">7-day study streak</p>
                      </div>
                    )}

                    {/* First Note */}
                    {notes.length > 0 && (
                      <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="font-semibold text-sm text-gray-900">Note Taker</p>
                        <p className="text-xs text-gray-600">Created first note</p>
                      </div>
                    )}

                    {/* 10 Notes */}
                    {notes.length >= 10 && (
                      <div className="text-center p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                        <div className="text-4xl mb-2">📚</div>
                        <p className="font-semibold text-sm text-gray-900">Organized</p>
                        <p className="text-xs text-gray-600">10+ notes created</p>
                      </div>
                    )}

                    {/* Locked badges (examples) */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 opacity-50">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="font-semibold text-sm text-gray-500">First Tutorial</p>
                      <p className="text-xs text-gray-400">Complete a tutorial</p>
                    </div>

                    <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200 opacity-50">
                      <div className="text-4xl mb-2">🔒</div>
                      <p className="font-semibold text-sm text-gray-500">Top Student</p>
                      <p className="text-xs text-gray-400">Reach 50 tutorials</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Milestones */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                    Learning Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tutorials Completed</span>
                        <span className="text-sm font-medium text-gray-900">12 / 50</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Study Hours</span>
                        <span className="text-sm font-medium text-gray-900">24 / 100</span>
                      </div>
                      <Progress value={24} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Notes Created</span>
                        <span className="text-sm font-medium text-gray-900">{notes.length} / 20</span>
                      </div>
                      <Progress value={(notes.length / 20) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="space-y-6">
              {/* Performance Overview */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                    Performance Overview
                  </CardTitle>
                  <p className="text-gray-600">Track your learning progress and achievements</p>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-blue-50 rounded-lg">
                      <BarChart3 className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-blue-600">75%</p>
                      <p className="text-sm text-gray-600 mt-1">Overall Progress</p>
                    </div>
                    <div className="text-center p-6 bg-green-50 rounded-lg">
                      <TrendingUp className="h-10 w-10 text-green-600 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-green-600">+15%</p>
                      <p className="text-sm text-gray-600 mt-1">This Month</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-lg">
                      <Award className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-purple-600">Top 20%</p>
                      <p className="text-sm text-gray-600 mt-1">Ranking</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject-wise Progress */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <PieChart className="mr-2 h-5 w-5 text-purple-600" />
                    Subject-wise Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Mathematics</span>
                        <span className="text-sm font-medium text-gray-900">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">8 tutorials completed • 12 hours studied</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Science</span>
                        <span className="text-sm font-medium text-gray-900">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">6 tutorials completed • 9 hours studied</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">English</span>
                        <span className="text-sm font-medium text-gray-900">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">5 tutorials completed • 7 hours studied</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">History</span>
                        <span className="text-sm font-medium text-gray-900">45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">3 tutorials completed • 4 hours studied</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Study Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <Calendar className="mr-2 h-5 w-5 text-green-600" />
                      Weekly Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <div key={day} className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600 w-10">{day}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full flex items-center justify-end px-2"
                              style={{ width: `${[80, 65, 90, 75, 85, 60, 70][idx]}%` }}
                            >
                              <span className="text-xs font-semibold text-white">{[4, 3, 5, 3.5, 4, 2.5, 3][idx]}h</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="flex items-center text-gray-900">
                      <Target className="mr-2 h-5 w-5 text-orange-600" />
                      Strengths & Areas to Improve
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-green-700 mb-2">💪 Strengths</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Algebra</Badge>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Grammar</Badge>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Physics</Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-orange-700 mb-2">📈 Focus Areas</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Geometry</Badge>
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Essay Writing</Badge>
                          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Chemistry</Badge>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                          💡 <span className="font-medium">Tip:</span> Focus on Geometry this week for balanced progress!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendations */}
              <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-sm">
                <CardHeader className="border-b border-indigo-100">
                  <CardTitle className="flex items-center text-gray-900">
                    <Star className="mr-2 h-5 w-5 text-indigo-600" />
                    Personalized Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
                      <BookOpen className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Advanced Geometry Tutorial</p>
                        <p className="text-xs text-gray-600">Based on your current progress, this will help strengthen your skills</p>
                      </div>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">View</Button>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-100">
                      <GraduationCap className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Essay Writing Masterclass</p>
                        <p className="text-xs text-gray-600">Students with similar profiles found this helpful</p>
                      </div>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">View</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <div className="space-y-6">
              {/* Notes Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white border-gray-200 shadow-sm text-center p-4">
                  <BookMarked className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{notes.length}</p>
                  <p className="text-xs text-gray-600">Total Notes</p>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm text-center p-4">
                  <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{notes.filter(n => n.category === 'mathematics').length}</p>
                  <p className="text-xs text-gray-600">Mathematics</p>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm text-center p-4">
                  <GraduationCap className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{notes.filter(n => n.category === 'science').length}</p>
                  <p className="text-xs text-gray-600">Science</p>
                </Card>
                <Card className="bg-white border-gray-200 shadow-sm text-center p-4">
                  <Edit className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{notes.filter(n => n.category === 'general').length}</p>
                  <p className="text-xs text-gray-600">General</p>
                </Card>
              </div>

              {/* Create Note */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-gray-900 flex items-center">
                      <Edit className="mr-2 h-5 w-5 text-blue-600" />
                      Create New Note
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-4">
                    <div>
                      <Label htmlFor="noteTitle" className="text-sm font-semibold text-gray-700 mb-2">Title</Label>
                      <Input 
                        id="noteTitle"
                        value={noteTitle} 
                        onChange={(e)=>setNoteTitle(e.target.value)} 
                        placeholder="Enter note title" 
                        className="bg-white border-gray-300 text-gray-900" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="noteCategory" className="text-sm font-semibold text-gray-700 mb-2">Category</Label>
                      <Select value={noteCategory} onValueChange={setNoteCategory}>
                        <SelectTrigger className="bg-white border-gray-300">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">📝 General</SelectItem>
                          <SelectItem value="mathematics">🔢 Mathematics</SelectItem>
                          <SelectItem value="science">🔬 Science</SelectItem>
                          <SelectItem value="english">📚 English</SelectItem>
                          <SelectItem value="history">🏛️ History</SelectItem>
                          <SelectItem value="other">📌 Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="noteBody" className="text-sm font-semibold text-gray-700 mb-2">Content</Label>
                      <Textarea 
                        id="noteBody"
                        value={noteBody} 
                        onChange={(e)=>setNoteBody(e.target.value)} 
                        placeholder="Write your note..." 
                        className="min-h-[200px] bg-white border-gray-300 text-gray-900" 
                      />
                    </div>
                    <Button onClick={addNote} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Save className="mr-2 h-4 w-4" />
                      Save Note
                    </Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-gray-900 flex items-center">
                      <Eye className="mr-2 h-5 w-5 text-blue-600" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg text-gray-900">{noteTitle || 'Untitled'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {noteCategory === 'mathematics' && '🔢 Mathematics'}
                          {noteCategory === 'science' && '🔬 Science'}
                          {noteCategory === 'english' && '📚 English'}
                          {noteCategory === 'history' && '🏛️ History'}
                          {noteCategory === 'general' && '📝 General'}
                          {noteCategory === 'other' && '📌 Other'}
                        </Badge>
                      </div>
                    </div>
                    <div className="prose max-w-none whitespace-pre-wrap text-gray-700 p-4 bg-gray-50 rounded-md min-h-[200px]">
                      {notesPreview || 'Your note content will appear here...'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Notes Filter */}
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center text-gray-900">
                      <BookMarked className="mr-2 h-5 w-5 text-purple-600" />
                      My Notes ({notes.filter(n => notesFilter === 'all' || n.category === notesFilter).length})
                    </CardTitle>
                    <Select value={notesFilter} onValueChange={setNotesFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="general">📝 General</SelectItem>
                        <SelectItem value="mathematics">🔢 Mathematics</SelectItem>
                        <SelectItem value="science">🔬 Science</SelectItem>
                        <SelectItem value="english">📚 English</SelectItem>
                        <SelectItem value="history">🏛️ History</SelectItem>
                        <SelectItem value="other">📌 Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {notes.filter(n => notesFilter === 'all' || n.category === notesFilter).length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <BookMarked className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No notes in this category yet.</p>
                      <p className="text-sm">Create your first note to get started!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {notes
                        .filter(n => notesFilter === 'all' || n.category === notesFilter)
                        .map(n => (
                          <Card key={n.id} className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="border-b border-gray-100 pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base text-gray-900 mb-1">{n.title}</CardTitle>
                                  <Badge variant="outline" className="text-xs">
                                    {n.category === 'mathematics' && '🔢 Math'}
                                    {n.category === 'science' && '🔬 Science'}
                                    {n.category === 'english' && '📚 English'}
                                    {n.category === 'history' && '🏛️ History'}
                                    {n.category === 'general' && '📝 General'}
                                    {n.category === 'other' && '📌 Other'}
                                  </Badge>
                                </div>
                              </div>
                              {n.createdAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(n.createdAt).toLocaleDateString()}
                                </p>
                              )}
                            </CardHeader>
                            <CardContent className="pt-3">
                              <div className="text-sm whitespace-pre-wrap mb-3 text-gray-700 line-clamp-3">
                                {n.body}
                              </div>
                              <Button variant="destructive" onClick={()=>deleteNote(n.id)} size="sm" className="w-full">
                                <X className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </LearnerLayout>
  );
};

export default LearnerDashboard;


