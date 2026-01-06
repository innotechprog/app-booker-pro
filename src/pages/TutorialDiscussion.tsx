import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  ArrowLeft, 
  Play, 
  Send, 
  ThumbsUp, 
  Clock, 
  Star, 
  Eye, 
  User, 
  Bot, 
  MessageCircle,
  Video,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { TutorialItem, mockTutorials } from "@/data/tutorials";

const TutorialDiscussion = () => {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [tutorial, setTutorial] = useState<TutorialItem | null>(null);
  const [discussionQuestion, setDiscussionQuestion] = useState("");
  const [discussionThreads, setDiscussionThreads] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get tutorial from location state or find by ID
  useEffect(() => {
    if (location.state?.tutorial) {
      setTutorial(location.state.tutorial);
    } else if (tutorialId) {
      const foundTutorial = mockTutorials.find(t => t.id === parseInt(tutorialId));
      if (foundTutorial) {
        setTutorial(foundTutorial);
      }
    }
  }, [tutorialId, location.state]);

  // Load discussion threads
  useEffect(() => {
    if (tutorial) {
      // Load existing discussion threads (mock data for now)
      const threads = [
        {
          id: 1,
          user: "Sarah M.",
          question: "Can you explain the quadratic formula in more detail?",
          answer: "The quadratic formula is x = (-b ± √(b²-4ac)) / 2a. It's derived from completing the square...",
          answeredBy: "AI Assistant",
          timestamp: "2 hours ago",
          likes: 5,
          isLiked: false
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
      setDiscussionThreads(threads);
    }
  }, [tutorial]);

  const handleSubmitQuestion = async () => {
    if (!discussionQuestion.trim()) return;
    
    if (!isAuthenticated) {
      toast.error("Please log in to ask questions");
      navigate("/learner/login");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

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
    } catch (error) {
      toast.error("Failed to submit question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = (threadId: number) => {
    setDiscussionThreads(prev => prev.map(t => 
      t.id === threadId 
        ? { ...t, isLiked: !t.isLiked, likes: t.isLiked ? t.likes - 1 : t.likes + 1 }
        : t
    ));
  };

  if (!tutorial) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Tutorial Not Found</h1>
            <Button onClick={() => navigate("/tutorials/available")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tutorials
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/tutorials/available")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{tutorial.title}</h1>
                  <p className="text-sm text-gray-600">{tutorial.subject} • {tutorial.grade}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{tutorial.difficulty}</Badge>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                  {tutorial.rating}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Split Screen */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Video Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-900 rounded-t-lg flex items-center justify-center relative">
                    <div className="text-center text-white">
                      <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Video Player</p>
                      <p className="text-sm opacity-75">Click to play tutorial</p>
                    </div>
                    <Button
                      className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => window.open(tutorial.videoUrl, '_blank')}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch on YouTube
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tutorial Details */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">About This Tutorial</h2>
                      <p className="text-gray-600">{tutorial.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <span className="text-sm text-gray-600">Duration</span>
                        <p className="font-medium text-gray-900">{tutorial.duration}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Subject</span>
                        <p className="font-medium text-gray-900">{tutorial.subject}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Grade</span>
                        <p className="font-medium text-gray-900">{tutorial.grade}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Views</span>
                        <p className="font-medium text-gray-900">{tutorial.views.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Topics */}
                    <div className="pt-4 border-t">
                      <h3 className="font-semibold text-gray-900 mb-2">Topics Covered</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutorial.topics.map((topic, index) => (
                          <Badge key={index} variant="outline" className="text-sm">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Tutor Info */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <img
                          src={tutorial.tutorPhoto}
                          alt={tutorial.tutor}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{tutorial.tutor}</h3>
                          <p className="text-sm text-gray-600">{tutorial.school}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                            <span className="text-sm text-gray-600">{tutorial.rating}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const tutorMap: Record<string, string> = {
                              'Dr. Sarah Johnson': 'sarah-johnson',
                              'Prof. Michael Chen': 'michael-chen',
                              'Dr. Emma Williams': 'emma-williams',
                              'Prof. David Brown': 'david-brown',
                            };
                            const tutorId = tutorMap[tutorial.tutor] || tutorial.tutor.toLowerCase().replace(/\s+/g, '-');
                            navigate(`/tutor/${tutorId}`);
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-3">{tutorial.tutorBio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Discussion Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20 h-[calc(100vh-8rem)] flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Discussion Header */}
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <h2 className="text-lg font-bold text-gray-900">Discussion</h2>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Ask questions and get answers from AI or the tutor
                    </p>
                  </div>

                  {/* Discussion Threads - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {discussionThreads.length > 0 ? (
                      discussionThreads.map((thread) => (
                        <div key={thread.id} className="border rounded-lg p-3 bg-white">
                          <div className="space-y-2">
                            {/* Question */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-700">{thread.user || "Anonymous"}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{thread.timestamp}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{thread.question}</p>
                            </div>

                            {/* Answer */}
                            {thread.answer ? (
                              <div className="mt-2 p-2 bg-gray-50 rounded-lg border-l-2 border-blue-500">
                                <div className="flex items-center gap-2 mb-1">
                                  {thread.answeredBy === "AI Assistant" ? (
                                    <Bot className="h-3 w-3 text-blue-600" />
                                  ) : (
                                    <User className="h-3 w-3 text-blue-600" />
                                  )}
                                  <span className="text-xs font-medium text-gray-700">
                                    {thread.answeredBy || "AI Assistant"}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">{thread.answer}</p>
                              </div>
                            ) : (
                              <div className="mt-2 p-2 bg-yellow-50 rounded-lg border-l-2 border-yellow-400">
                                <p className="text-xs text-yellow-800">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  Waiting for answer...
                                </p>
                              </div>
                            )}

                            {/* Like Button */}
                            <div className="flex items-center pt-2 border-t border-gray-100">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`h-6 px-2 text-xs ${thread.isLiked ? 'text-blue-600' : 'text-gray-500'}`}
                                onClick={() => handleLike(thread.id)}
                              >
                                <ThumbsUp className="h-3 w-3 mr-1" />
                                {thread.likes}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No questions yet. Be the first to ask!</p>
                      </div>
                    )}
                  </div>

                  {/* Ask Question Form - Fixed at Bottom */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    {isAuthenticated ? (
                      <div className="space-y-2">
                        <Input
                          value={discussionQuestion}
                          onChange={(e) => setDiscussionQuestion(e.target.value)}
                          placeholder="Ask a question..."
                          className="text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && discussionQuestion.trim() && !isSubmitting) {
                              handleSubmitQuestion();
                            }
                          }}
                        />
                        <Button
                          onClick={handleSubmitQuestion}
                          disabled={!discussionQuestion.trim() || isSubmitting}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          {isSubmitting ? (
                            <>
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Ask Question
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-600 mb-2">Log in to ask questions</p>
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => navigate("/learner/login")}
                        >
                          Log In
                        </Button>
                      </div>
                    )}
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

export default TutorialDiscussion;

