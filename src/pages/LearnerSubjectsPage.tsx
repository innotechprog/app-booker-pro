import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import LearnerLayout from "@/components/LearnerLayout";
import { useAuth } from "@/contexts/AuthContext";
import { learnerAPI, subjectsAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  GraduationCap,
  Plus,
  X,
  Clock,
  Star,
  Play,
  FileText,
  TrendingUp,
  Award,
  Search,
  Download,
  ExternalLink,
  Video,
  Headphones,
  FileQuestion,
  Lightbulb,
  Book,
  Bookmark
} from "lucide-react";

// Predefined subject categories
const AVAILABLE_SUBJECTS = [
  // Mathematics
  { name: "Mathematics", category: "Core Subjects", emoji: "🔢" },
  { name: "Algebra", category: "Mathematics", emoji: "🔢" },
  { name: "Geometry", category: "Mathematics", emoji: "📐" },
  { name: "Calculus", category: "Mathematics", emoji: "📊" },
  { name: "Statistics", category: "Mathematics", emoji: "📈" },
  { name: "Trigonometry", category: "Mathematics", emoji: "📐" },
  
  // Sciences
  { name: "Physical Science", category: "Core Subjects", emoji: "🔬" },
  { name: "Life Science", category: "Core Subjects", emoji: "🧬" },
  { name: "Physics", category: "Sciences", emoji: "⚛️" },
  { name: "Chemistry", category: "Sciences", emoji: "🧪" },
  { name: "Biology", category: "Sciences", emoji: "🧬" },
  
  // Languages
  { name: "English", category: "Core Subjects", emoji: "📚" },
  { name: "Afrikaans", category: "Languages", emoji: "🗣️" },
  { name: "IsiZulu", category: "Languages", emoji: "🗣️" },
  { name: "IsiXhosa", category: "Languages", emoji: "🗣️" },
  { name: "Sesotho", category: "Languages", emoji: "🗣️" },
  
  // Humanities
  { name: "History", category: "Core Subjects", emoji: "🏛️" },
  { name: "Geography", category: "Core Subjects", emoji: "🌍" },
  
  // Business & Economics
  { name: "Accounting", category: "Core Subjects", emoji: "💰" },
  { name: "Economics", category: "Core Subjects", emoji: "📊" },
  { name: "Business Studies", category: "Business", emoji: "💼" },
  
  // Technology & IT
  { name: "Computer Science", category: "Technology", emoji: "💻" },
  { name: "Information Technology", category: "Technology", emoji: "🖥️" },
  { name: "CAT (Computer Applications Technology)", category: "Technology", emoji: "⌨️" },
  
  // Arts & Culture
  { name: "Visual Arts", category: "Arts", emoji: "🎨" },
  { name: "Music", category: "Arts", emoji: "🎵" },
  { name: "Drama", category: "Arts", emoji: "🎭" },
  
  // Other
  { name: "Life Orientation", category: "Core Subjects", emoji: "🎯" },
  { name: "Agricultural Science", category: "Sciences", emoji: "🌾" },
  { name: "Tourism", category: "Business", emoji: "✈️" },
];

const LearnerSubjectsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userSubjects, setUserSubjects] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectSearchQuery, setSubjectSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Sample subject content data
  const subjectContent = {
    default: {
      tutorials: [
        { id: 1, title: "Introduction to the Subject", duration: "15 min", completed: false },
        { id: 2, title: "Core Concepts", duration: "25 min", completed: false },
        { id: 3, title: "Practice Problems", duration: "30 min", completed: false },
      ],
      studyGuides: [
        { id: 1, title: "Complete Study Guide", type: "PDF", size: "2.4 MB", icon: Book, color: "blue" },
        { id: 2, title: "Quick Reference Sheet", type: "PDF", size: "850 KB", icon: FileText, color: "green" },
        { id: 3, title: "Exam Preparation Guide", type: "PDF", size: "1.8 MB", icon: FileQuestion, color: "purple" },
      ],
      videos: [
        { id: 1, title: "Visual Explanation Series", duration: "45 min", type: "Video Series", icon: Video },
        { id: 2, title: "Concept Animation", duration: "12 min", type: "Animation", icon: Play },
      ],
      podcasts: [
        { id: 1, title: "Expert Discussions", duration: "30 min", type: "Podcast", icon: Headphones },
        { id: 2, title: "Topic Deep Dive", duration: "25 min", type: "Audio", icon: Headphones },
      ],
      interactiveResources: [
        { id: 1, title: "Interactive Quiz Bank", items: "50 questions", icon: FileQuestion, color: "orange" },
        { id: 2, title: "Practice Worksheets", items: "15 worksheets", icon: FileText, color: "teal" },
        { id: 3, title: "Flashcard Sets", items: "120 cards", icon: Bookmark, color: "pink" },
      ],
      externalLinks: [
        { id: 1, title: "Khan Academy", description: "Free online courses and tutorials", url: "#" },
        { id: 2, title: "Coursera", description: "University-level courses", url: "#" },
        { id: 3, title: "YouTube Channels", description: "Curated video playlists", url: "#" },
      ],
      studyTips: [
        "Review notes within 24 hours of learning for better retention",
        "Practice active recall instead of passive reading",
        "Use spaced repetition for long-term memory",
        "Teach concepts to others to reinforce understanding",
        "Take regular breaks using the Pomodoro technique"
      ],
      progress: 0,
      totalHours: 0,
      resources: 0,
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/learner/login");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load user profile
        const profileResponse = await learnerAPI.getProfile();
        if (profileResponse.success) {
          setProfile(profileResponse.profile);
        }

        // Load user subjects
        const subjectsResponse = await learnerAPI.getSubjects();
        if (subjectsResponse.success) {
          setUserSubjects(subjectsResponse.subjects);
        }

        // Load available subjects
        const availableResponse = await subjectsAPI.getAll();
        if (availableResponse.success) {
          setAvailableSubjects(availableResponse.subjects);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, navigate]);

  const addSubjectFromList = async (subjectName: string) => {
    const currentSubjects = userSubjects.map(s => s.name);
    if (currentSubjects.includes(subjectName)) {
      alert("This subject is already added!");
      return;
    }

    try {
      const response = await learnerAPI.addSubject(subjectName);
      if (response.success) {
        // Reload user subjects
        const subjectsResponse = await learnerAPI.getSubjects();
        if (subjectsResponse.success) {
          setUserSubjects(subjectsResponse.subjects);
        }
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Failed to add subject. Please try again.');
    }

    setSubjectSearchQuery("");
    setShowAddSubject(false);
  };

  const removeSubject = async (subjectName: string) => {
    const subject = userSubjects.find(s => s.name === subjectName);
    if (!subject) return;

    try {
      const response = await learnerAPI.removeSubject(subject.id);
      if (response.success) {
        // Reload user subjects
        const subjectsResponse = await learnerAPI.getSubjects();
        if (subjectsResponse.success) {
          setUserSubjects(subjectsResponse.subjects);
        }
      }
    } catch (error) {
      console.error('Error removing subject:', error);
      alert('Failed to remove subject. Please try again.');
    }

    if (selectedSubject === subjectName) {
      setSelectedSubject(null);
    }
  };

  const subjects = userSubjects.map(s => s.name);
  const filteredSubjects = userSubjects.filter((s: any) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter available subjects for add dropdown
  const availableToAdd = availableSubjects.filter(
    (s) => 
      !subjects.includes(s.name) && 
      (s.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()) ||
       s.category.toLowerCase().includes(subjectSearchQuery.toLowerCase()))
  );

  const getSubjectEmoji = (subject: string) => {
    const subjectData = availableSubjects.find(s => s.name === subject) || 
                       AVAILABLE_SUBJECTS.find(s => s.name === subject);
    return subjectData?.emoji || '📖';
  };

  const getSubjectCategory = (subject: string) => {
    const subjectData = availableSubjects.find(s => s.name === subject) || 
                       AVAILABLE_SUBJECTS.find(s => s.name === subject);
    return subjectData?.category || 'Other';
  };

  const getSubjectColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-teal-500 to-teal-600',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <LearnerLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your subjects...</p>
          </div>
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SEO title="My Subjects - Learner Portal" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Subjects</h1>
            <p className="text-gray-600">
              Manage your subjects and explore learning content for each one
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Subjects List */}
            <div className="lg:col-span-1">
              <Card className="bg-white border-gray-200 shadow-sm sticky top-4">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="flex items-center text-gray-900">
                      <GraduationCap className="mr-2 h-5 w-5 text-blue-600" />
                      All Subjects ({subjects.length})
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddSubject(!showAddSubject)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Add Subject Dropdown */}
                  {showAddSubject && (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={subjectSearchQuery}
                          onChange={(e) => setSubjectSearchQuery(e.target.value)}
                          placeholder="Search subjects to add..."
                          className="pl-9"
                        />
                      </div>
                      <div className="max-h-[300px] overflow-y-auto bg-white border border-gray-200 rounded-md">
                        {availableToAdd.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            {subjectSearchQuery ? 'No subjects match your search' : 'All available subjects added'}
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {availableToAdd.map((subject) => (
                              <div
                                key={subject.name}
                                className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                                onClick={() => addSubjectFromList(subject.name)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{subject.emoji}</span>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-900">{subject.name}</p>
                                    <Badge variant="outline" className="text-xs mt-1">{subject.category}</Badge>
                                  </div>
                                  <Plus className="h-4 w-4 text-gray-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Search */}
                  {subjects.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search subjects..."
                        className="pl-9"
                      />
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-0">
                  {filteredSubjects.length === 0 ? (
                    <div className="text-center py-12 px-4">
                      <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-4">
                        {subjects.length === 0
                          ? "No subjects added yet"
                          : "No subjects match your search"}
                      </p>
                      {subjects.length === 0 && (
                        <Button onClick={() => setShowAddSubject(true)} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Subject
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredSubjects.map((subject: any, idx: number) => (
                        <div
                          key={subject.id}
                          className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                            selectedSubject === subject.name ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                          }`}
                          onClick={() => setSelectedSubject(subject.name)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getSubjectColor(idx)} flex items-center justify-center text-2xl`}>
                                {getSubjectEmoji(subject.name)}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{subject.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{getSubjectCategory(subject.name)}</Badge>
                                  <span className="text-xs text-gray-500">{subject.progress || 0}% complete</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubject(subject.name);
                              }}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Subject Content */}
            <div className="lg:col-span-2">
              {!selectedSubject ? (
                <Card className="bg-white border-gray-200 shadow-sm">
                  <CardContent className="py-16 text-center">
                    <BookOpen className="h-20 w-20 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Select a Subject
                    </h3>
                    <p className="text-gray-500">
                      Click on any subject from the left to view its content, tutorials, and resources
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Subject Header */}
                  <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white shadow-lg">
                    <CardContent className="py-8">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-4xl">
                            {getSubjectEmoji(selectedSubject)}
                          </div>
                          <div>
                            <h2 className="text-3xl font-bold mb-2">{selectedSubject}</h2>
                            <div className="flex items-center gap-4 text-sm text-blue-100">
                              <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                3 Tutorials
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                1.2 hours
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                0% Complete
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Overall Progress</span>
                          <span>0%</span>
                        </div>
                        <Progress value={0} className="h-2 bg-white/20" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-white border-gray-200 shadow-sm">
                      <CardContent className="text-center p-4">
                        <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-600">0%</p>
                        <p className="text-xs text-gray-600">Progress</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200 shadow-sm">
                      <CardContent className="text-center p-4">
                        <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-600">0h</p>
                        <p className="text-xs text-gray-600">Time Spent</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-gray-200 shadow-sm">
                      <CardContent className="text-center p-4">
                        <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-purple-600">0</p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tutorials */}
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center text-gray-900">
                        <Play className="mr-2 h-5 w-5 text-green-600" />
                        Available Tutorials
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {subjectContent.default.tutorials.map((tutorial) => (
                          <div
                            key={tutorial.id}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Play className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{tutorial.title}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {tutorial.duration}
                                </span>
                                {tutorial.completed && (
                                  <Badge variant="secondary" className="text-xs">
                                    ✓ Completed
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              {tutorial.completed ? 'Review' : 'Start'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Study Guides */}
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center text-gray-900">
                        <Book className="mr-2 h-5 w-5 text-blue-600" />
                        Study Guides & PDFs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {subjectContent.default.studyGuides.map((guide) => {
                          const Icon = guide.icon;
                          return (
                            <div
                              key={guide.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            >
                              <div className={`w-10 h-10 bg-${guide.color}-100 rounded-lg flex items-center justify-center`}>
                                <Icon className={`h-5 w-5 text-${guide.color}-600`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-gray-900">{guide.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{guide.type}</Badge>
                                  <span className="text-xs text-gray-500">{guide.size}</span>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost">
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Video Resources */}
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center text-gray-900">
                        <Video className="mr-2 h-5 w-5 text-red-600" />
                        Video Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {subjectContent.default.videos.map((video) => {
                          const Icon = video.icon;
                          return (
                            <div
                              key={video.id}
                              className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-100 hover:shadow-md transition-shadow cursor-pointer"
                            >
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <Icon className="h-5 w-5 text-red-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-gray-900">{video.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">{video.type}</Badge>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {video.duration}
                                  </span>
                                </div>
                              </div>
                              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                Watch
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Audio Resources */}
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center text-gray-900">
                        <Headphones className="mr-2 h-5 w-5 text-purple-600" />
                        Audio Resources & Podcasts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {subjectContent.default.podcasts.map((podcast) => {
                          const Icon = podcast.icon;
                          return (
                            <div
                              key={podcast.id}
                              className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow cursor-pointer"
                            >
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Icon className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-sm text-gray-900">{podcast.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">{podcast.type}</Badge>
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {podcast.duration}
                                  </span>
                                </div>
                              </div>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                Listen
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interactive Resources */}
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center text-gray-900">
                        <FileQuestion className="mr-2 h-5 w-5 text-orange-600" />
                        Interactive Practice
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {subjectContent.default.interactiveResources.map((resource) => {
                          const Icon = resource.icon;
                          return (
                            <div
                              key={resource.id}
                              className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                            >
                              <div className={`w-12 h-12 bg-${resource.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3`}>
                                <Icon className={`h-6 w-6 text-${resource.color}-600`} />
                              </div>
                              <h4 className="font-semibold text-sm text-gray-900 mb-1">{resource.title}</h4>
                              <p className="text-xs text-gray-500 mb-3">{resource.items}</p>
                              <Button size="sm" variant="outline" className="w-full">
                                Practice
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* External Resources */}
                  <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="flex items-center text-gray-900">
                        <ExternalLink className="mr-2 h-5 w-5 text-green-600" />
                        External Learning Resources
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        {subjectContent.default.externalLinks.map((link) => (
                          <div
                            key={link.id}
                            className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100 hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ExternalLink className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-900">{link.title}</h4>
                              <p className="text-xs text-gray-600 mt-1">{link.description}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              Visit
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Study Tips */}
                  <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-sm">
                    <CardHeader className="border-b border-yellow-100">
                      <CardTitle className="flex items-center text-gray-900">
                        <Lightbulb className="mr-2 h-5 w-5 text-yellow-600" />
                        Study Tips & Best Practices
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {subjectContent.default.studyTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-yellow-700">{idx + 1}</span>
                            </div>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default LearnerSubjectsPage;

