import { useMemo, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AccessLevel, getUserAccessLevel, canAccess, needsUpgrade, getUpgradeMessage } from "@/utils/accessControl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { ArrowLeft, Search, Star, Clock, Users, MapPin, Eye, Play, Filter, User, BookOpen, TrendingUp, Calendar, Award, MessageCircle, Bot, Send, ThumbsUp, ThumbsDown, Video, CheckCircle, ExternalLink } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TutorialItem } from "@/data/tutorials";
import { useAuth } from "@/contexts/AuthContext";
import { subjectsAPI, tutorialsAPI, bookingsAPI } from "@/services/api";

type AvailableTutorialsProps = { hideHeader?: boolean };

const AvailableTutorials = ({ hideHeader = false }: AvailableTutorialsProps) => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { grade?: string; subject?: string } };
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTutor, setSelectedTutor] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TutorialItem | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");
  const [discussionQuestion, setDiscussionQuestion] = useState("");
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTutorialForBooking, setSelectedTutorialForBooking] = useState<TutorialItem | null>(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    duration: '1',
    sessionType: 'online',
    notes: ''
  });
  const [processingBooking, setProcessingBooking] = useState(false);
  const [enrolledSubjects, setEnrolledSubjects] = useState<string[]>([]);
  const [discussionThreads, setDiscussionThreads] = useState<any[]>([]);
  const [tutorials, setTutorials] = useState<TutorialItem[]>([]);
  const [tutorialsLoading, setTutorialsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useAuth();

  // Map API tutorial to TutorialItem format
  const mapApiTutorial = (t: any): TutorialItem & { tutorId?: number } => ({
    id: t.id,
    title: t.title || "",
    duration: `${t.duration_minutes || 60} min`,
    difficulty: t.difficulty || "Beginner",
    school: "IBIS Education",
    tutor: t.tutor_name || "Tutor",
    tutorPhoto: t.tutor_photo || "",
    tutorBio: t.tutor_bio || "",
    rating: parseFloat(t.rating) || 0,
    topics: (t.description || "").split(" ").slice(0, 5).filter(Boolean) || [],
    views: t.views || 0,
    grade: t.grade || "",
    subject: t.subject || "",
    videoThumbnail: t.thumbnail_url || "",
    videoUrl: t.video_url || "https://www.youtube.com/watch?v=J8l2O_AGYEw",
    description: t.description || "",
    dateAdded: t.created_at ? new Date(t.created_at).toISOString().split("T")[0] : "",
    isPopular: !!t.is_popular,
    isRecent: !!t.created_at && new Date(t.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    tutorId: t.tutor_id
  });

  // Load tutorials from API
  useEffect(() => {
    const loadTutorials = async () => {
      try {
        setTutorialsLoading(true);
        const res = await tutorialsAPI.getAll({});
        if (res.success && res.tutorials) {
          setTutorials(res.tutorials.map(mapApiTutorial));
        } else {
          setTutorials([]);
        }
      } catch (err) {
        console.error("Error loading tutorials:", err);
        setTutorials([]);
      } finally {
        setTutorialsLoading(false);
      }
    };
    loadTutorials();
  }, []);

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
          // Fallback to localStorage
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
        // Fallback to localStorage for non-authenticated users
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

  // Check if learner is enrolled in a subject that matches the tutorial
  const isEnrolledInTutorialSubject = (tutorial: TutorialItem) => {
    if (!isLearnerLoggedIn()) return false;
    if (enrolledSubjects.length === 0) return false;
    
    // Check if any enrolled subject matches the tutorial subject
    return enrolledSubjects.some(enrolled => 
      enrolled.toLowerCase().includes(tutorial.subject.toLowerCase()) ||
      tutorial.subject.toLowerCase().includes(enrolled.toLowerCase())
    );
  };

  // Get tutor ID for navigation (use tutorId from API when available)
  const getTutorId = (tutorial: TutorialItem & { tutorId?: number }) => {
    if (tutorial.tutorId) return String(tutorial.tutorId);
    const tutorMap: Record<string, string> = {
      'Dr. Sarah Johnson': '1',
      'Prof. Michael Chen': '2',
      'Dr. Emma Williams': '3',
      'Prof. David Brown': '4',
    };
    return tutorMap[tutorial.tutor] || tutorial.tutor.toLowerCase().replace(/\s+/g, '-');
  };

  // Handle booking session with authentication check
  const handleBookSession = (tutorial: TutorialItem) => {
    if (!isLearnerLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }
    // Set the selected tutorial and show booking modal
    setSelectedTutorialForBooking(tutorial);
    setBookingData({
      date: '',
      time: '',
      duration: '1',
      sessionType: 'online',
      notes: ''
    });
    setShowBookingModal(true);
  };

  // Handle booking submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.date || !bookingData.time) {
      toast.error("Please select date and time for the session");
      return;
    }

    const tutorial = selectedTutorialForBooking as (TutorialItem & { tutorId?: number });
    if (!tutorial) {
      toast.error("No tutorial selected");
      return;
    }

    const tutorId = tutorial.tutorId;
    if (!tutorId) {
      toast.error("Tutor information is missing. Please book from the Tutors page instead.");
      return;
    }

    setProcessingBooking(true);

    try {
      const res = await bookingsAPI.create({
        tutorId: String(tutorId),
        subject: tutorial.subject,
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration,
        sessionType: bookingData.sessionType,
        notes: bookingData.notes
      });

      if (res.success) {
        toast.success("Live session booked successfully! You will receive a confirmation email shortly.");
        setShowBookingModal(false);
        setSelectedTutorialForBooking(null);
        setBookingData({
          date: "",
          time: "",
          duration: "1",
          sessionType: "online",
          notes: ""
        });
      } else {
        throw new Error(res.message || "Booking failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to book session. Please try again.");
    } finally {
      setProcessingBooking(false);
    }
  };

  // Handle access restricted features
  const handleAccessRestricted = (requiredLevel: AccessLevel) => {
    setUpgradeMessage(getUpgradeMessage(requiredLevel));
    setShowUpgradePrompt(true);
  };

  // Get discussion data (mock)
  const getDiscussionData = (tutorialId: number) => {
    return [
      {
        id: 1,
        question: "Can you explain the quadratic formula in more detail?",
        answer: "The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. It's derived from completing the square...",
        answeredBy: "AI Assistant",
        timestamp: "2 hours ago",
        likes: 5,
        isLiked: true
      },
      {
        id: 2,
        question: "What are the practical applications of this concept?",
        answer: "Quadratic equations are used in physics for projectile motion, in economics for profit optimization...",
        answeredBy: "Dr. Sarah Johnson",
        timestamp: "1 day ago",
        likes: 3,
        isLiked: false
      }
    ];
  };

  // Handle submit question
  const handleSubmitQuestion = () => {
    if (!discussionQuestion.trim()) return;
    if (!isLearnerLoggedIn()) {
      toast.error("Please log in to ask questions");
      return;
    }
    
    // Add question to discussion threads
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

  // Open video modal
  const openVideoModal = (tutorial: TutorialItem) => {
    setSelectedVideo(tutorial);
    setShowVideoModal(true);
    setShowDiscussion(true); // Show discussion by default
  };

  // Clear all filters
  const clearFilters = () => {
    setQuery("");
    setSelectedGrade("");
    setSelectedSubject("");
    setSelectedDifficulty("");
    setSelectedTutor("");
  };

  // Filter tutorials based on search and filters
  const filtered = useMemo(() => {
    let result = [...tutorials];

    // Text search
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/);
      result = result.filter(tutorial => {
        const searchableText = [
          tutorial.title,
          tutorial.tutor,
          tutorial.school,
          tutorial.subject,
          tutorial.grade,
          ...tutorial.topics
        ].join(' ').toLowerCase();
        
        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Grade filter
    if (selectedGrade) {
      result = result.filter(tutorial => tutorial.grade.includes(selectedGrade));
    }

    // Subject filter
    if (selectedSubject) {
      result = result.filter(tutorial => tutorial.subject.toLowerCase().includes(selectedSubject.toLowerCase()));
    }

    // Difficulty filter
    if (selectedDifficulty) {
      result = result.filter(tutorial => tutorial.difficulty.toLowerCase() === selectedDifficulty.toLowerCase());
    }

    // Tutor filter
    if (selectedTutor) {
      result = result.filter(tutorial => tutorial.tutor.toLowerCase().includes(selectedTutor.toLowerCase()));
    }

    // Sort results
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'duration':
        result.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        break;
      default:
        // Keep original order for relevance
        break;
    }

    return result;
  }, [tutorials, query, selectedGrade, selectedSubject, selectedDifficulty, selectedTutor, sortBy]);

  // Get unique values for filter dropdowns
  const uniqueGrades = useMemo(() => [...new Set(tutorials.map(t => t.grade).filter(Boolean))], [tutorials]);
  const uniqueSubjects = useMemo(() => [...new Set(tutorials.map(t => t.subject).filter(Boolean))], [tutorials]);
  const uniqueDifficulties = useMemo(() => [...new Set(tutorials.map(t => t.difficulty).filter(Boolean))], [tutorials]);
  const uniqueTutors = useMemo(() => [...new Set(tutorials.map(t => t.tutor).filter(Boolean))], [tutorials]);

  // Get popular and recent tutorials for stats
  const popularTutorials = useMemo(() => tutorials.filter(t => t.isPopular).length, [tutorials]);
  const recentTutorials = useMemo(() => tutorials.filter(t => t.isRecent).length, [tutorials]);

  // Generate suggestions for autocomplete
  const suggestions = useMemo(() => {
    const raw = query;
    const endedWithSpace = /\s$/.test(raw);
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    const current = endedWithSpace ? '' : (parts[parts.length - 1] || '');
    const pool: string[] = [];

    if (current.length > 0) {
      // Add matching tutors, schools, subjects, grades, and topics
      tutorials.forEach(t => {
        if (t.tutor.toLowerCase().includes(current.toLowerCase())) pool.push(t.tutor);
        if (t.school.toLowerCase().includes(current.toLowerCase())) pool.push(t.school);
        if (t.subject.toLowerCase().includes(current.toLowerCase())) pool.push(t.subject);
        if (t.grade.toLowerCase().includes(current.toLowerCase())) pool.push(t.grade);
        t.topics.forEach(topic => {
          if (topic.toLowerCase().includes(current.toLowerCase())) pool.push(topic);
        });
      });
    } else if (endedWithSpace) {
      // Show general suggestions when typing a new token
      pool.push(...uniqueTutors.slice(0, 3));
      pool.push(...uniqueSubjects.slice(0, 2));
    }

    return [...new Set(pool)].slice(0, 8);
  }, [query, uniqueTutors, uniqueSubjects, tutorials]);

  // Add token to query
  const addTokenToQuery = (token: string) => {
    const raw = query;
    const endedWithSpace = /\s$/.test(raw);
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    
    if (endedWithSpace) {
      const next = (raw + token + ' ').replace(/\s+/g, ' ');
      setQuery(next.trimStart());
      setShowSuggestions(false);
      return;
    }
    const newParts = [...parts];
    newParts[newParts.length - 1] = token;
    setQuery(newParts.join(' ') + ' ');
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Available Tutorials" />
      
      {/* Header Section (hidden when embedded in learner portal) */}
      {!hideHeader && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(-1)}
                  className="text-white hover:bg-white/20 mb-4"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <h1 className="text-4xl font-bold mb-2">Available Tutorials</h1>
                <p className="text-blue-100 text-lg">
                  Discover expert-led tutorials tailored to your learning needs
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{tutorials.length}</div>
                <div className="text-white/80">Total Tutorials</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{uniqueTutors.length}</div>
                <div className="text-white/80">Expert Tutors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{popularTutorials}</div>
                <div className="text-white/80">Popular</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{recentTutorials}</div>
                <div className="text-white/80">Recently Added</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(query.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search by tutor, school, subject, grade, or topic..."
              className="pl-10 bg-white text-gray-900 placeholder-gray-500"
            />
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addTokenToQuery(suggestion);
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full lg:w-48 bg-white text-gray-900">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>

          {/* Filters Button */}
          <Button
            variant="outlineLight"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full lg:w-auto"
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Active Filters */}
        {(query || selectedGrade || selectedSubject || selectedDifficulty || selectedTutor) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {query && (
              <Badge variant="secondary" className="border border-gray-300 text-gray-700 bg-white">
                Search: {query}
                <button
                  onClick={() => setQuery("")}
                  className="ml-2 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedGrade && (
              <Badge variant="secondary" className="border border-gray-300 text-gray-700 bg-white">
                Grade: {selectedGrade}
                <button
                  onClick={() => setSelectedGrade("")}
                  className="ml-2 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedSubject && (
              <Badge variant="secondary" className="border border-gray-300 text-gray-700 bg-white">
                Subject: {selectedSubject}
                <button
                  onClick={() => setSelectedSubject("")}
                  className="ml-2 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedDifficulty && (
              <Badge variant="secondary" className="border border-gray-300 text-gray-700 bg-white">
                Difficulty: {selectedDifficulty}
                <button
                  onClick={() => setSelectedDifficulty("")}
                  className="ml-2 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedTutor && (
              <Badge variant="secondary" className="border border-gray-300 text-gray-700 bg-white">
                Tutor: {selectedTutor}
                <button
                  onClick={() => setSelectedTutor("")}
                  className="ml-2 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        )}

        {/* Advanced Filters Sidebar */}
        {showFilters && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Grade</label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Grades</SelectItem>
                    {uniqueGrades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {uniqueSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty</label>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    {uniqueDifficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tutor</label>
                <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tutors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tutors</SelectItem>
                    {uniqueTutors.map(tutor => (
                      <SelectItem key={tutor} value={tutor}>{tutor}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {filtered.length} Tutorial{filtered.length !== 1 ? 's' : ''} Found
          </h2>
        </div>

        {/* Tutorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tutorialsLoading ? (
            <div className="col-span-full text-center py-12 text-gray-500">Loading tutorials...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">No tutorials found.</div>
          ) : filtered.map((tutorial) => (
            <Card key={tutorial.id} className="shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="relative">
                <img
                  src={tutorial.videoThumbnail}
                  alt={tutorial.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    size="lg"
                    className="bg-white/90 text-gray-900 hover:bg-white"
                    onClick={() => openVideoModal(tutorial)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Preview
                  </Button>
                </div>
                {tutorial.isPopular && (
                  <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Popular
                  </Badge>
                )}
                {tutorial.isRecent && (
                  <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                    <Calendar className="mr-1 h-3 w-3" />
                    New
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedSubject(tutorial.subject); }}
                    className="inline-flex items-center rounded-full border border-gray-300 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    {tutorial.subject}
                  </button>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs ml-1 text-gray-600">{tutorial.rating}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">
                  {tutorial.title}
                </h3>

                <p className="text-sm text-gray-700 mb-3">
                  {tutorial.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-700 mb-3">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {tutorial.duration}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {tutorial.views} views
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-700 mb-3">
                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                    {tutorial.grade}
                  </Badge>
                  <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                    {tutorial.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/tutor/${getTutorId(tutorial)}`)}
                    className="flex items-center flex-1 text-left rounded-lg hover:bg-gray-50 p-1 -m-1 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <img
                      src={tutorial.tutorPhoto}
                      alt={tutorial.tutor}
                      className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{tutorial.tutor}</p>
                      <p className="text-xs text-gray-700">{tutorial.school}</p>
                    </div>
                  </button>
                  <Button
                    size="sm"
                    variant="ghostLight"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/tutor/${getTutorId(tutorial)}`);
                    }}
                  >
                    <User className="h-3 w-3 mr-1" />
                    View Profile
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {tutorial.topics.slice(0, 3).map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs border-gray-300 text-gray-700">
                      {topic}
                    </Badge>
                  ))}
                  {tutorial.topics.length > 3 && (
                    <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                      +{tutorial.topics.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outlineLight"
                    className="w-full"
                    onClick={() => openVideoModal(tutorial)}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    Watch Tutorial
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => handleBookSession(tutorial)}
                  >
                    <Video className="mr-1 h-3 w-3" />
                    Book Live Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutorials found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <Button onClick={clearFilters}>Clear All Filters</Button>
          </div>
        )}
      </div>

      {/* Video Preview Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedVideo?.title}</span>
              <div className="flex gap-2">
                <Button
                  variant="outlineLight"
                  size="sm"
                  onClick={() => {
                    setShowVideoModal(false);
                    navigate(`/tutorials/discussion/${selectedVideo.id}`, { state: { tutorial: selectedVideo } });
                  }}
                >
                  <MessageCircle className="mr-1 h-3 w-3" />
                  Discussion
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selectedVideo && (
            <div className="space-y-6">
              {/* Video Player Placeholder */}
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Video Player</p>
                  <p className="text-sm opacity-75">Click to play tutorial</p>
                </div>
              </div>

              {/* Tutorial Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">About This Tutorial</h3>
                    <p className="text-gray-600">{selectedVideo.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Topics Covered</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedVideo.topics.map((topic, index) => (
                        <Badge key={index} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Grade Level:</span>
                      <p className="text-gray-600">{selectedVideo.grade}</p>
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span>
                      <p className="text-gray-600">{selectedVideo.subject}</p>
                    </div>
                    <div>
                      <span className="font-medium">Difficulty:</span>
                      <p className="text-gray-600">{selectedVideo.difficulty}</p>
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>
                      <p className="text-gray-600">{selectedVideo.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Tutor Information */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <img
                          src={selectedVideo.tutorPhoto}
                          alt={selectedVideo.tutor}
                          className="w-12 h-12 rounded-full mr-3"
                        />
                        <div>
                          <h4 className="font-semibold">{selectedVideo.tutor}</h4>
                          <p className="text-sm text-gray-600">{selectedVideo.school}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center text-yellow-500">
                          <Star className="h-4 w-4 fill-current" />
                          <span className="ml-1 text-gray-600">{selectedVideo.rating}</span>
                        </div>
                        <div className="text-gray-600">
                          {selectedVideo.views} views
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {isEnrolledInTutorialSubject(selectedVideo) || canAccess(AccessLevel.REGISTERED)
                          ? selectedVideo.tutorBio 
                          : "Enroll in this subject to view tutor bio and contact information"
                        }
                      </p>

                      <div className="space-y-2">
                        <Button className="w-full" size="sm" onClick={() => openVideoModal(selectedVideo)}>
                          <Play className="mr-1 h-3 w-3" />
                          Watch Full Tutorial
                        </Button>
                        {isEnrolledInTutorialSubject(selectedVideo) && (
                          <Button 
                            className="w-full" 
                            size="sm"
                            variant="outlineLight"
                            onClick={() => {
                              setShowVideoModal(false);
                              navigate(`/tutor/${getTutorId(selectedVideo)}`);
                            }}
                          >
                            <User className="mr-1 h-3 w-3" />
                            View Tutor Profile
                          </Button>
                        )}
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                          size="sm"
                          onClick={() => {
                            setShowVideoModal(false);
                            handleBookSession(selectedVideo);
                          }}
                        >
                          <Video className="mr-1 h-3 w-3" />
                          Book Live Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Discussion Button */}
              <div className="border-t pt-6">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    setShowVideoModal(false);
                    navigate(`/tutorials/discussion/${selectedVideo.id}`, { state: { tutorial: selectedVideo } });
                  }}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Open Discussion
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Prompt Modal */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>You need to be logged in to book a session with a tutor.</p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <a href="/learner/register">Register</a>
              </Button>
              <Button asChild variant="outlineLight" className="flex-1">
                <a href="/learner/login">Login</a>
              </Button>
            </div>
            <Button variant="ghostLight" onClick={() => setShowLoginPrompt(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Prompt Modal */}
      <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>{upgradeMessage}</p>
            <div className="flex gap-2">
              <Button asChild className="flex-1">
                <a href="/learner/register">Register Now</a>
              </Button>
              <Button variant="outlineLight" onClick={() => setShowUpgradePrompt(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Book Live Session Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-blue-600" />
              Book Live Session
            </DialogTitle>
          </DialogHeader>

          {selectedTutorialForBooking && (
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              {/* Tutorial Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedTutorialForBooking.videoThumbnail}
                      alt={selectedTutorialForBooking.title}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {selectedTutorialForBooking.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {selectedTutorialForBooking.subject} • {selectedTutorialForBooking.grade}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {selectedTutorialForBooking.tutor}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                          {selectedTutorialForBooking.rating}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-date" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Session Date *
                    </Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full"
                    />
                  </div>

                  {/* Time */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-time" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Session Time *
                    </Label>
                    <Input
                      id="booking-time"
                      type="time"
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-duration">Duration (hours) *</Label>
                    <Select
                      value={bookingData.duration}
                      onValueChange={(value) => setBookingData({ ...bookingData, duration: value })}
                    >
                      <SelectTrigger id="booking-duration">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="1.5">1.5 hours</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="2.5">2.5 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Session Type */}
                  <div className="space-y-2">
                    <Label htmlFor="booking-type">Session Type *</Label>
                    <Select
                      value={bookingData.sessionType}
                      onValueChange={(value) => setBookingData({ ...bookingData, sessionType: value })}
                    >
                      <SelectTrigger id="booking-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="in-person">In-Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="booking-notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="booking-notes"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Any specific topics you'd like to focus on or questions you have..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Session Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-gray-900 mb-3">Session Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Subject:</span>
                      <p className="font-medium text-gray-900">{selectedTutorialForBooking.subject}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Grade:</span>
                      <p className="font-medium text-gray-900">{selectedTutorialForBooking.grade}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tutor:</span>
                      <p className="font-medium text-gray-900">{selectedTutorialForBooking.tutor}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <p className="font-medium text-gray-900">{bookingData.duration} hour(s)</p>
                    </div>
                    {bookingData.date && (
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(bookingData.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    {bookingData.time && (
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <p className="font-medium text-gray-900">
                          {(() => {
                            const [hours, minutes] = bookingData.time.split(':');
                            const hour = parseInt(hours);
                            const ampm = hour >= 12 ? 'PM' : 'AM';
                            const displayHour = hour % 12 || 12;
                            return `${displayHour}:${minutes} ${ampm}`;
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outlineLight"
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedTutorialForBooking(null);
                  }}
                  className="flex-1"
                  disabled={processingBooking}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={processingBooking || !bookingData.date || !bookingData.time}
                >
                  {processingBooking ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {!isLearnerLoggedIn() && <Footer />}
    </div>
  );
};

export default AvailableTutorials;