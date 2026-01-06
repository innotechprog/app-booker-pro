import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AccessLevel, getUserAccessLevel, canAccess, needsUpgrade, getUpgradeMessage } from "@/utils/accessControl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { subjectsAPI } from "@/services/api";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  Users, 
  MapPin, 
  Eye, 
  Play, 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Award,
  GraduationCap,
  MessageCircle,
  Mail,
  Phone,
  Bot,
  Send,
  ThumbsUp,
  ThumbsDown,
  User
} from "lucide-react";

interface TutorialItem {
  id: number;
  title: string;
  duration: string;
  difficulty: string;
  school: string;
  tutor: string;
  tutorPhoto: string;
  tutorBio: string;
  rating: number;
  topics: string[];
  views: number;
  grade: string;
  subject: string;
  videoThumbnail: string;
  videoUrl: string;
  description: string;
  dateAdded: string;
  isPopular: boolean;
  isRecent: boolean;
}

interface TutorProfile {
  id: string;
  name: string;
  photo: string;
  bio: string;
  rating: number;
  totalStudents: number;
  totalTutorials: number;
  experience: string;
  education: string;
  specializations: string[];
  achievements: string[];
  contactEmail: string;
  contactPhone: string;
  joinedDate: string;
  school: string;
  department: string;
}

// Mock data - in a real app, this would come from an API
const mockTutorials: TutorialItem[] = [
  { 
    id: 1, 
    title: "Introduction to Algebra", 
    duration: "45 min", 
    difficulty: "Beginner", 
    school: "University of Cape Town", 
    tutor: "Dr. Sarah Johnson", 
    tutorPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Mathematics professor with 15 years of experience in teaching algebra and calculus. PhD in Mathematics from MIT.",
    rating: 4.9, 
    topics: ["algebra", "variables", "equations"], 
    views: 1250,
    grade: "Grade 9-10",
    subject: "Mathematics",
    videoThumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Learn the fundamentals of algebra including variables, constants, and basic equations. Perfect for beginners starting their algebra journey.",
    dateAdded: "2024-01-15",
    isPopular: true,
    isRecent: false
  },
  { 
    id: 5, 
    title: "Functions & Graphs", 
    duration: "55 min", 
    difficulty: "Intermediate", 
    school: "University of Cape Town", 
    tutor: "Dr. Sarah Johnson", 
    tutorPhoto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Mathematics professor with 15 years of experience in teaching algebra and calculus. PhD in Mathematics from MIT.",
    rating: 4.8, 
    topics: ["functions", "graphs", "transformations"], 
    views: 1190,
    grade: "Grade 10-11",
    subject: "Mathematics",
    videoThumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Explore different types of functions and learn to graph them with various transformations and applications.",
    dateAdded: "2024-01-12",
    isPopular: false,
    isRecent: false
  },
  { 
    id: 2, 
    title: "Quadratic Equations", 
    duration: "60 min", 
    difficulty: "Intermediate", 
    school: "University of the Witwatersrand", 
    tutor: "Prof. Michael Chen", 
    tutorPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Senior Mathematics lecturer specializing in advanced algebra and geometry. Published researcher in mathematical education.",
    rating: 4.8, 
    topics: ["quadratic", "parabola", "factorisation"], 
    views: 980,
    grade: "Grade 11-12",
    subject: "Mathematics",
    videoThumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Master quadratic equations through step-by-step problem solving and graphical analysis. Includes factorization and completing the square methods.",
    dateAdded: "2024-01-20",
    isPopular: false,
    isRecent: true
  },
  { 
    id: 6, 
    title: "Trigonometry Basics", 
    duration: "50 min", 
    difficulty: "Beginner", 
    school: "University of the Witwatersrand", 
    tutor: "Prof. Michael Chen", 
    tutorPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    tutorBio: "Senior Mathematics lecturer specializing in advanced algebra and geometry. Published researcher in mathematical education.",
    rating: 4.6, 
    topics: ["trigonometry", "sine", "cosine", "angles"], 
    views: 860,
    grade: "Grade 10-11",
    subject: "Mathematics",
    videoThumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=225&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    description: "Introduction to trigonometric functions, angles, and basic trigonometric identities with practical examples.",
    dateAdded: "2024-01-25",
    isPopular: false,
    isRecent: true
  }
];

const mockTutorProfiles: TutorProfile[] = [
  {
    id: "sarah-johnson",
    name: "Dr. Sarah Johnson",
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
    bio: "Dr. Sarah Johnson is a distinguished mathematics professor with over 15 years of experience in teaching algebra, calculus, and advanced mathematics. She holds a PhD in Mathematics from MIT and has published numerous research papers in mathematical education. Dr. Johnson is passionate about making mathematics accessible and engaging for students of all levels.",
    rating: 4.9,
    totalStudents: 2500,
    totalTutorials: 12,
    experience: "15+ years",
    education: "PhD in Mathematics, MIT",
    specializations: ["Algebra", "Calculus", "Linear Algebra", "Statistics"],
    achievements: [
      "MIT Distinguished Teaching Award 2020",
      "Published 25+ research papers",
      "Mathematics Education Excellence Award 2019",
      "Student Choice Award 2021"
    ],
    contactEmail: "sarah.johnson@uct.ac.za",
    contactPhone: "+27 21 650 3000",
    joinedDate: "2018-03-15",
    school: "University of Cape Town",
    department: "Mathematics and Applied Mathematics"
  },
  {
    id: "michael-chen",
    name: "Prof. Michael Chen",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
    bio: "Professor Michael Chen is a senior mathematics lecturer specializing in advanced algebra, geometry, and mathematical education research. With over 12 years of teaching experience, he has developed innovative teaching methods that have helped thousands of students excel in mathematics. His research focuses on improving mathematical learning outcomes.",
    rating: 4.8,
    totalStudents: 1800,
    totalTutorials: 8,
    experience: "12+ years",
    education: "PhD in Mathematics Education, Stanford University",
    specializations: ["Advanced Algebra", "Geometry", "Trigonometry", "Mathematical Education"],
    achievements: [
      "Stanford Teaching Excellence Award 2019",
      "Research Innovation Award 2020",
      "Published 18+ papers in education journals",
      "Mathematics Society Recognition 2021"
    ],
    contactEmail: "michael.chen@wits.ac.za",
    contactPhone: "+27 11 717 1000",
    joinedDate: "2019-08-20",
    school: "University of the Witwatersrand",
    department: "School of Mathematics"
  },
  {
    id: "emma-williams",
    name: "Dr. Emma Williams",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
    bio: "Dr. Emma Williams is a distinguished professor of mathematics with expertise in calculus and mathematical analysis. She has authored several calculus textbooks and has over 18 years of teaching experience. Her research focuses on advanced calculus applications and mathematical modeling.",
    rating: 4.9,
    totalStudents: 2200,
    totalTutorials: 10,
    experience: "18+ years",
    education: "PhD in Mathematical Analysis, Cambridge University",
    specializations: ["Calculus", "Mathematical Analysis", "Differential Equations", "Mathematical Modeling"],
    achievements: [
      "Cambridge Mathematics Excellence Award 2018",
      "Author of 3 bestselling calculus textbooks",
      "Mathematical Analysis Research Grant 2021",
      "Outstanding Teaching Award 2020"
    ],
    contactEmail: "emma.williams@ru.ac.za",
    contactPhone: "+27 46 603 8000",
    joinedDate: "2017-02-10",
    school: "Rhodes University",
    department: "Department of Mathematics"
  },
  {
    id: "david-brown",
    name: "Prof. David Brown",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    bio: "Professor David Brown is a statistics professor with extensive experience in data analysis and probability theory. He has consulted for various research projects and has over 14 years of teaching experience. His expertise includes statistical modeling and data interpretation.",
    rating: 4.7,
    totalStudents: 1600,
    totalTutorials: 7,
    experience: "14+ years",
    education: "PhD in Statistics, University of California, Berkeley",
    specializations: ["Statistics", "Probability Theory", "Data Analysis", "Statistical Modeling"],
    achievements: [
      "Berkeley Statistics Excellence Award 2017",
      "Data Analysis Consultant for 50+ research projects",
      "Statistical Methods Innovation Award 2019",
      "Published 20+ statistical research papers"
    ],
    contactEmail: "david.brown@sun.ac.za",
    contactPhone: "+27 21 808 4000",
    joinedDate: "2018-07-15",
    school: "Stellenbosch University",
    department: "Department of Statistics and Actuarial Science"
  },
  {
    id: "lisa-anderson",
    name: "Dr. Lisa Anderson",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
    bio: "Dr. Lisa Anderson is an English Literature professor with expertise in poetry and prose analysis. She is a published author and literary critic with over 16 years of teaching experience. Her research focuses on contemporary literature and literary theory.",
    rating: 4.8,
    totalStudents: 1400,
    totalTutorials: 6,
    experience: "16+ years",
    education: "PhD in English Literature, Oxford University",
    specializations: ["English Literature", "Poetry Analysis", "Prose Analysis", "Literary Theory"],
    achievements: [
      "Oxford Literature Excellence Award 2016",
      "Published author of 2 novels and 1 poetry collection",
      "Literary Criticism Award 2020",
      "Student Choice Award for Literature 2021"
    ],
    contactEmail: "lisa.anderson@ukzn.ac.za",
    contactPhone: "+27 31 260 1000",
    joinedDate: "2019-01-20",
    school: "University of KwaZulu-Natal",
    department: "School of Arts"
  },
  {
    id: "james-wilson",
    name: "Prof. James Wilson",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
    bio: "Professor James Wilson is a physics professor specializing in mechanics and thermodynamics. He is a former NASA researcher with 20 years of teaching experience. His expertise includes classical mechanics, quantum physics, and thermodynamics applications.",
    rating: 4.9,
    totalStudents: 2000,
    totalTutorials: 9,
    experience: "20+ years",
    education: "PhD in Physics, California Institute of Technology",
    specializations: ["Classical Mechanics", "Thermodynamics", "Quantum Physics", "Physics Education"],
    achievements: [
      "NASA Research Excellence Award 2015",
      "Caltech Physics Innovation Award 2018",
      "Physics Education Research Grant 2020",
      "Former NASA Research Scientist (2010-2015)"
    ],
    contactEmail: "james.wilson@uct.ac.za",
    contactPhone: "+27 21 650 3000",
    joinedDate: "2016-09-01",
    school: "University of Cape Town",
    department: "Department of Physics"
  }
];

const TutorProfile = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("recent");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TutorialItem | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [discussionQuestion, setDiscussionQuestion] = useState("");
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [discussionThreads, setDiscussionThreads] = useState<any[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Check if learner is logged in
  const isLearnerLoggedIn = () => {
    return (localStorage.getItem('learnerData') || localStorage.getItem('learner_current')) !== null || isAuthenticated;
  };

  // Load enrolled subjects
  useEffect(() => {
    const loadEnrolledSubjects = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const response = await subjectsAPI.getEnrolled(user.id);
          if (response.success) {
            const subjectNames = response.subjects.map((s: any) => s.name || s.subject_name);
            setEnrolledSubjects(subjectNames);
          }
        } catch (error) {
          console.error('Error loading enrolled subjects:', error);
          const stored = localStorage.getItem('enrolledSubjects');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              const names = parsed.map((s: any) => s.name);
              setEnrolledSubjects(names);
            } catch (e) {
              console.error('Error parsing stored subjects:', e);
            }
          }
        }
      } else {
        const stored = localStorage.getItem('enrolledSubjects');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const names = parsed.map((s: any) => s.name);
            setEnrolledSubjects(names);
          } catch (e) {
            console.error('Error parsing stored subjects:', e);
          }
        }
      }
    };

    loadEnrolledSubjects();
  }, [isAuthenticated, user]);

  // Find tutor profile
  const tutor = mockTutorProfiles.find(t => t.id === tutorId);

  // Get tutor's tutorials
  const tutorTutorials = useMemo(() => {
    if (!tutor) return [];
    return mockTutorials.filter(t => t.tutor === tutor.name);
  }, [tutor]);

  // Check if learner is enrolled in a subject that the tutor teaches
  const isEnrolledInTutorSubject = () => {
    if (!isLearnerLoggedIn()) return false;
    if (!tutor) return false;
    if (enrolledSubjects.length === 0) return false;
    
    // Check if any enrolled subject matches the tutor's specializations
    return tutor.specializations.some(specialization => 
      enrolledSubjects.some(enrolled => 
        enrolled.toLowerCase().includes(specialization.toLowerCase()) ||
        specialization.toLowerCase().includes(enrolled.toLowerCase())
      )
    ) || tutorTutorials.some(tutorial =>
      enrolledSubjects.some(enrolled =>
        enrolled.toLowerCase().includes(tutorial.subject.toLowerCase()) ||
        tutorial.subject.toLowerCase().includes(enrolled.toLowerCase())
      )
    );
  };

  // Sort tutorials
  const sortedTutorials = useMemo(() => {
    switch (sortBy) {
      case "popular":
        return [...tutorTutorials].sort((a, b) => b.views - a.views);
      case "recent":
        return [...tutorTutorials].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      case "rating":
        return [...tutorTutorials].sort((a, b) => b.rating - a.rating);
      case "duration":
        return [...tutorTutorials].sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
      default:
        return tutorTutorials;
    }
  }, [tutorTutorials, sortBy]);

  const openVideoModal = (tutorial: TutorialItem) => {
    setSelectedVideo(tutorial);
    setShowVideoModal(true);
    setShowDiscussion(true); // Show discussion by default
  };

  const handleBookSession = (tutorial: TutorialItem) => {
    if (!isLearnerLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }
    
    // If logged in, proceed with booking
    // In a real app, this would redirect to a booking form or calendar
    alert(`Booking session with ${tutorial.tutor} for "${tutorial.title}"`);
  };

  const handleAccessRestricted = (requiredLevel: AccessLevel) => {
    if (needsUpgrade(requiredLevel)) {
      setUpgradeMessage(getUpgradeMessage(requiredLevel));
      setShowUpgradePrompt(true);
    }
  };

  const getCurrentAccessLevel = () => {
    return getUserAccessLevel();
  };

  // Mock discussion data
  const getDiscussionData = (tutorialId: number) => {
    return [
      {
        id: 1,
        user: "Sarah M.",
        question: "Can you explain the concept of derivatives in more detail?",
        answer: "Great question! Derivatives represent the rate of change of a function. Think of it as how fast something is changing at any given point...",
        answeredBy: "AI Assistant",
        timestamp: "2 hours ago",
        likes: 5,
        isLiked: false
      },
      {
        id: 2,
        user: "Mike K.",
        question: "What's the difference between a limit and a derivative?",
        answer: "A limit is the value that a function approaches as the input approaches a certain point, while a derivative is the limit of the difference quotient...",
        answeredBy: tutor?.name || "Tutor",
        timestamp: "1 day ago",
        likes: 8,
        isLiked: true
      },
      {
        id: 3,
        user: "Emma L.",
        question: "Can you provide more examples of chain rule applications?",
        answer: null, // Unanswered question
        answeredBy: null,
        timestamp: "3 days ago",
        likes: 2,
        isLiked: false
      }
    ];
  };

  const handleSubmitQuestion = () => {
    if (!discussionQuestion.trim()) return;
    if (!isLearnerLoggedIn()) {
      toast.error("Please log in to ask questions");
      return;
    }
    
    const newQuestion = {
      id: Date.now(),
      question: discussionQuestion,
      answer: null,
      answeredBy: null,
      timestamp: "Just now",
      likes: 0,
      isLiked: false,
      user: user?.fullName || "You"
    };
    
    setDiscussionThreads(prev => [newQuestion, ...prev]);
    toast.success("Question submitted! It will be answered soon.");
    setDiscussionQuestion("");
  };

  // Load discussion threads when video modal opens
  useEffect(() => {
    if (selectedVideo && showDiscussion) {
      const threads = getDiscussionData(selectedVideo.id);
      setDiscussionThreads(threads);
    }
  }, [selectedVideo, showDiscussion]);

  if (!tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tutor Not Found</h1>
          <Button onClick={() => navigate('/tutorials/available')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutorials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO page="tutorials" />

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-gray-900" 
              onClick={() => navigate('/tutorials/available')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tutorials
            </Button>
          </div>

          {/* Tutor Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="flex-shrink-0">
              <img 
                src={tutor.photo} 
                alt={tutor.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{tutor.name}</h1>
              <p className="text-xl text-white/80 mb-4">{tutor.school} • {tutor.department}</p>
              <p className="text-white/90 mb-6 max-w-3xl">{tutor.bio}</p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{tutor.rating}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-300" />
                    <span className="text-sm font-medium">Students</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{tutor.totalStudents.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-blue-300" />
                    <span className="text-sm font-medium">Tutorials</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{tutor.totalTutorials}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-purple-300" />
                    <span className="text-sm font-medium">Experience</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">{tutor.experience}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tutor Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Contact</span>
                    {!canAccess(AccessLevel.REGISTERED) && (
                      <Badge variant="outline" className="ml-auto text-xs">Register Required</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canAccess(AccessLevel.REGISTERED) ? (
                    <>
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{tutor.contactEmail}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{tutor.contactPhone}</span>
                      </div>
                      <Button className="w-full mt-4">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageCircle className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Register to view contact information and send messages
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleAccessRestricted(AccessLevel.REGISTERED)}
                      >
                        Register to Access
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Education & Experience */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>Education</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{tutor.education}</p>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card>
                <CardHeader>
                  <CardTitle>Specializations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tutor.specializations.map((spec) => (
                      <Badge key={spec} variant="outline" className="border-blue-300 text-blue-700">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>Achievements</span>
                    {!canAccess(AccessLevel.PREMIUM) && (
                      <Badge variant="outline" className="ml-auto text-xs bg-yellow-50 border-yellow-200 text-yellow-700">Premium</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {canAccess(AccessLevel.PREMIUM) ? (
                    <ul className="space-y-2">
                      {tutor.achievements.map((achievement, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                          <Award className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Upgrade to Premium to view detailed achievements and awards
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => handleAccessRestricted(AccessLevel.PREMIUM)}
                      >
                        Upgrade to Premium
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tutorials Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Tutorials by {tutor.name.split(' ')[0]}
              </h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sortedTutorials.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tutorials Yet</h3>
                <p className="text-gray-600">This tutor hasn't published any tutorials yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedTutorials.map(tutorial => (
                  <Card key={tutorial.id} className="transition-all duration-300 hover:shadow-xl bg-white border border-gray-200 overflow-hidden">
                    {/* Video Thumbnail */}
                    <div className="relative">
                      <img 
                        src={tutorial.videoThumbnail} 
                        alt={tutorial.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        <Button
                          size="lg"
                          className="opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white/90 hover:bg-white text-gray-900"
                          onClick={() => openVideoModal(tutorial)}
                        >
                          <Play className="h-6 w-6 mr-2" />
                          Preview
                        </Button>
                      </div>
                      {tutorial.isPopular && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                      {tutorial.isRecent && (
                        <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                          <Calendar className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{tutorial.title}</CardTitle>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tutorial.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="border-gray-300 text-gray-700 text-xs">{tutorial.difficulty}</Badge>
                        <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">{tutorial.grade}</Badge>
                        <Badge variant="outline" className="border-green-300 text-green-700 text-xs">{tutorial.subject}</Badge>
                        <div className="flex items-center space-x-1 text-gray-700">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="text-xs font-medium">{tutorial.rating}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Tutorial Details */}
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs">{tutorial.duration}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span className="text-xs">{tutorial.views.toLocaleString()} views</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span className="text-xs">{tutorial.school}</span>
                          </div>
                          <span className="text-xs text-gray-500">{tutorial.dateAdded}</span>
                        </div>
                      </div>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-1">
                        {tutorial.topics.slice(0, 3).map((topic) => (
                          <Badge key={topic} variant="outline" className="text-xs border-gray-300 text-gray-700">
                            {topic}
                          </Badge>
                        ))}
                        {tutorial.topics.length > 3 && (
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-500">
                            +{tutorial.topics.length - 3} more
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => openVideoModal(tutorial)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Watch
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                          onClick={() => handleBookSession(tutorial)}
                        >
                          Book Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="space-y-6">
              {/* Video Player Placeholder */}
              <div className="relative w-full h-64 bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Video Preview</p>
                  <p className="text-sm opacity-75">Click to play full tutorial</p>
                </div>
              </div>

              {/* Discussion Tabs */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setShowDiscussion(false)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      !showDiscussion
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Tutorial Details
                  </button>
                  <button
                    onClick={() => {
                      if (selectedVideo) {
                        setShowVideoModal(false);
                        navigate(`/tutorials/discussion/${selectedVideo.id}`, { state: { tutorial: selectedVideo } });
                      }
                    }}
                    className="py-2 px-1 border-b-2 font-medium text-sm border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    <MessageCircle className="h-4 w-4 inline mr-2" />
                    Discussion ({getDiscussionData(selectedVideo.id).length})
                  </button>
                </nav>
              </div>

              {/* Content based on selected tab */}
              {!showDiscussion ? (
                <>
                  {/* Tutor Information */}
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={selectedVideo.tutorPhoto} 
                      alt={selectedVideo.tutor}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{selectedVideo.tutor}</h3>
                      <p className="text-sm text-gray-600 mb-2">{selectedVideo.tutorBio}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{selectedVideo.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{selectedVideo.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{selectedVideo.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tutorial Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-700">{selectedVideo.description}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Topics Covered</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedVideo.topics.map((topic) => (
                          <Badge key={topic} variant="outline" className="border-gray-300 text-gray-700">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Grade Level:</span>
                        <span className="ml-2 text-gray-700">{selectedVideo.grade}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Subject:</span>
                        <span className="ml-2 text-gray-700">{selectedVideo.subject}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Difficulty:</span>
                        <span className="ml-2 text-gray-700">{selectedVideo.difficulty}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">School:</span>
                        <span className="ml-2 text-gray-700">{selectedVideo.school}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4 border-t">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        window.open(selectedVideo.videoUrl, '_blank');
                      }}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Full Tutorial
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                      onClick={() => handleBookSession(selectedVideo)}
                    >
                      Book Live Session
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Discussion Button */}
                  <div className="border-t pt-6">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        if (selectedVideo) {
                          setShowVideoModal(false);
                          navigate(`/tutorials/discussion/${selectedVideo.id}`, { state: { tutorial: selectedVideo } });
                        }
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Open Discussion
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Prompt Modal */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Login Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Learner Profile</h3>
              <p className="text-gray-600 mb-6">
                To book tutoring sessions, you need to create a learner profile. This helps us personalize your learning experience and manage your bookings.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/learner/register');
                }}
              >
                Create Learner Account
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/learner/login');
                }}
              >
                Already have an account? Login
              </Button>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Prompt Modal */}
      <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">Upgrade Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Feature</h3>
              <p className="text-gray-600 mb-6">
                {upgradeMessage}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                onClick={() => {
                  setShowUpgradePrompt(false);
                  // In a real app, this would redirect to subscription page
                  alert('Redirecting to Premium subscription page...');
                }}
              >
                Upgrade to Premium
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setShowUpgradePrompt(false);
                  navigate('/learner/register');
                }}
              >
                Register Free Account
              </Button>
            </div>
            
            <div className="text-center">
              <button 
                onClick={() => setShowUpgradePrompt(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer hidden for logged-in learners */}
      {localStorage.getItem('learnerData') === null && <Footer />}
    </div>
  );
};

export default TutorProfile;

