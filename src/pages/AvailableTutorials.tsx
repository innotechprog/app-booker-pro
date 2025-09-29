import { useMemo, useState, useRef } from "react";
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
import { ArrowLeft, Search, Star, Clock, Users, MapPin, Eye, Play, Filter, User, BookOpen, TrendingUp, Calendar, Award, MessageCircle, Bot, Send, ThumbsUp, ThumbsDown } from "lucide-react";
import { TutorialItem, mockTutorials, getPersonalizedTutorials } from "@/data/tutorials";

const AvailableTutorials = () => {
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if learner is logged in
  const isLearnerLoggedIn = () => {
    return localStorage.getItem('learnerData') !== null;
  };

  // Handle booking session with authentication check
  const handleBookSession = (tutorial: TutorialItem) => {
    if (!isLearnerLoggedIn()) {
      setShowLoginPrompt(true);
      return;
    }
    // Proceed with booking logic here
    console.log('Booking session for:', tutorial.title);
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
    // In a real app, this would submit to a backend
    console.log('Submitting question:', discussionQuestion);
    setDiscussionQuestion("");
  };

  // Open video modal
  const openVideoModal = (tutorial: TutorialItem) => {
    setSelectedVideo(tutorial);
    setShowVideoModal(true);
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
    let result = mockTutorials;

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
  }, [query, selectedGrade, selectedSubject, selectedDifficulty, selectedTutor, sortBy]);

  // Get unique values for filter dropdowns
  const uniqueGrades = useMemo(() => [...new Set(mockTutorials.map(t => t.grade))], []);
  const uniqueSubjects = useMemo(() => [...new Set(mockTutorials.map(t => t.subject))], []);
  const uniqueDifficulties = useMemo(() => [...new Set(mockTutorials.map(t => t.difficulty))], []);
  const uniqueTutors = useMemo(() => [...new Set(mockTutorials.map(t => t.tutor))], []);

  // Get popular and recent tutorials for stats
  const popularTutorials = useMemo(() => mockTutorials.filter(t => t.isPopular).length, []);
  const recentTutorials = useMemo(() => mockTutorials.filter(t => t.isRecent).length, []);

  // Generate suggestions for autocomplete
  const suggestions = useMemo(() => {
    const raw = query;
    const endedWithSpace = /\s$/.test(raw);
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    const current = endedWithSpace ? '' : (parts[parts.length - 1] || '');
    const pool: string[] = [];

    if (current.length > 0) {
      // Add matching tutors, schools, subjects, grades, and topics
      mockTutorials.forEach(t => {
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
  }, [query, uniqueTutors, uniqueSubjects]);

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
      
      {/* Header Section */}
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
              <div className="text-3xl font-bold">{mockTutorials.length}</div>
              <div className="text-blue-200">Total Tutorials</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{uniqueTutors.length}</div>
              <div className="text-blue-200">Expert Tutors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{popularTutorials}</div>
              <div className="text-blue-200">Popular</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{recentTutorials}</div>
              <div className="text-blue-200">Recently Added</div>
            </div>
          </div>
        </div>
      </div>

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
            <SelectTrigger className="w-full lg:w-48">
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
            variant="outline"
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
          {filtered.map((tutorial) => (
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
                  <Badge className="absolute top-2 left-2 bg-orange-500">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Popular
                  </Badge>
                )}
                {tutorial.isRecent && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    <Calendar className="mr-1 h-3 w-3" />
                    New
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {tutorial.subject}
                  </Badge>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-xs ml-1 text-gray-600">{tutorial.rating}</span>
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {tutorial.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {tutorial.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {tutorial.duration}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {tutorial.views} views
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {tutorial.grade}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {tutorial.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center mb-3">
                  <img
                    src={tutorial.tutorPhoto}
                    alt={tutorial.tutor}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{tutorial.tutor}</p>
                    <p className="text-xs text-gray-500">{tutorial.school}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {tutorial.topics.slice(0, 3).map((topic, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {tutorial.topics.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{tutorial.topics.length - 3} more
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => openVideoModal(tutorial)}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    Watch
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleBookSession(tutorial)}
                  >
                    Book Session
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
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDiscussion(!showDiscussion)}
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
                        {canAccess(AccessLevel.REGISTERED) 
                          ? selectedVideo.tutorBio 
                          : "Register to view tutor bio and contact information"
                        }
                      </p>

                      <div className="space-y-2">
                        <Button className="w-full" size="sm">
                          <Play className="mr-1 h-3 w-3" />
                          Watch Full Tutorial
                        </Button>
                        <Button 
                          className="w-full" 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBookSession(selectedVideo)}
                        >
                          Book Live Session
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Discussion Section */}
              {showDiscussion && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Discussion</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Bot className="mr-1 h-4 w-4" />
                      AI Assistant Available
                      <Badge variant="secondary" className="ml-2">Coming Soon!</Badge>
                    </div>
                  </div>

                  {/* Ask Question Form */}
                  {canAccess(AccessLevel.REGISTERED) ? (
                    <div className="mb-6">
                      <div className="flex gap-2">
                        <Input
                          value={discussionQuestion}
                          onChange={(e) => setDiscussionQuestion(e.target.value)}
                          placeholder="Ask a question about this tutorial..."
                          className="flex-1"
                        />
                        <Button onClick={handleSubmitQuestion} disabled={!discussionQuestion.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Please register to ask questions and participate in discussions.
                      </p>
                    </div>
                  )}

                  {/* Discussion Threads */}
                  <div className="space-y-4">
                    {getDiscussionData(selectedVideo.id).map((thread) => (
                      <div key={thread.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{thread.question}</h4>
                          <span className="text-xs text-gray-500">{thread.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{thread.answer}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <span>Answered by {thread.answeredBy}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs ${thread.isLiked ? 'text-blue-600' : 'text-gray-500'}`}
                          >
                            <ThumbsUp className="mr-1 h-3 w-3" />
                            {thread.likes}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <Button asChild variant="outline" className="flex-1">
                <a href="/learner/login">Login</a>
              </Button>
            </div>
            <Button variant="ghost" onClick={() => setShowLoginPrompt(false)}>
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
              <Button variant="outline" onClick={() => setShowUpgradePrompt(false)}>
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AvailableTutorials;