import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Eye
} from "lucide-react";
import { getPersonalizedTutorials, TutorialItem } from "@/data/tutorials";

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Notes
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const notesPreview = useMemo(()=> noteBody, [noteBody]);

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
  }, [navigate]);

  const saveProfile = () => {
    if (!current) return;
    const learners = JSON.parse(localStorage.getItem("learners") || "[]");
    const idx = learners.findIndex((l: any)=> l.email === current.email);
    if (idx >= 0) { learners[idx] = profile; localStorage.setItem("learners", JSON.stringify(learners)); }
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
    const next = [{ id: Date.now(), title: noteTitle || "Untitled", body: noteBody }, ...notes];
    setNotes(next);
    localStorage.setItem(`notes_${current.email}`, JSON.stringify(next));
    setNoteTitle(""); setNoteBody("");
  };

  const deleteNote = (id: number) => {
    const next = notes.filter(n=> n.id !== id);
    setNotes(next);
    localStorage.setItem(`notes_${current.email}`, JSON.stringify(next));
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
    <div className="min-h-screen bg-gray-50">
      <SEO title="Learner Portal" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {profile?.fullName || profile?.name || 'Learner'}! 👋
              </h1>
              <p className="text-blue-100">
                Ready to continue your learning journey? Let's make today productive!
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200 mb-1">Profile Completion</div>
              <div className="text-2xl font-bold">{profileCompletion}%</div>
              <Progress value={profileCompletion} className="w-24 h-2 mt-2" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Tutorials Completed</h3>
            <p className="text-2xl font-bold text-blue-600">12</p>
          </Card>
          
          <Card className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Star className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Average Rating</h3>
            <p className="text-2xl font-bold text-green-600">4.8</p>
          </Card>
          
          <Card className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Study Hours</h3>
            <p className="text-2xl font-bold text-purple-600">24</p>
          </Card>
          
          <Card className="text-center p-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Progress</h3>
            <p className="text-2xl font-bold text-orange-600">85%</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/tutorials/available">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Tutorials
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/education">
              <GraduationCap className="mr-2 h-4 w-4" />
              Education Services
            </Link>
          </Button>
          <Button variant="outline" onClick={()=>{ localStorage.removeItem("learner_current"); navigate("/learner/login"); }}>
            <User className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="tutors">Tutors</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2">
                <Card className="shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center">
                        <User className="mr-2 h-5 w-5" />
                        My Profile
                      </CardTitle>
                      <Badge variant={profileCompletion === 100 ? "default" : "secondary"}>
                        {profileCompletion === 100 ? "Complete" : `${profileCompletion}% Complete`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</label>
                        <Input 
                          value={profile?.fullName || profile?.name || ''} 
                          onChange={(e)=>setProfile((p:any)=>({...p, fullName: e.target.value}))} 
                          placeholder="Enter your full name" 
                          className="h-12" 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                        <Input value={profile?.email || ''} disabled className="h-12" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
                        <Input 
                          value={profile?.password || ''} 
                          onChange={(e)=>setProfile((p:any)=>({...p, password: e.target.value}))} 
                          type="password" 
                          placeholder="Enter new password" 
                          className="h-12" 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Grade Level</label>
                        <Input 
                          value={profile?.grade || ''} 
                          onChange={(e)=>setProfile((p:any)=>({...p, grade: e.target.value}))} 
                          placeholder="e.g., Grade 10" 
                          className="h-12" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Learning Goals</label>
                      <Textarea 
                        value={profile?.goals || ''} 
                        onChange={(e)=>setProfile((p:any)=>({...p, goals: e.target.value}))} 
                        placeholder="What are your learning goals and aspirations?" 
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={saveProfile} className="bg-blue-600 hover:bg-blue-700">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save Profile
                      </Button>
                      <Button variant="destructive" onClick={deleteProfile}>
                        Delete Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Completion & Stats */}
              <div className="space-y-6">
                {/* Profile Completion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="mr-2 h-5 w-5" />
                      Profile Completion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{profileCompletion}%</div>
                        <Progress value={profileCompletion} className="h-3" />
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Name</span>
                          <CheckCircle className={`h-4 w-4 ${profile?.fullName || profile?.name ? 'text-green-500' : 'text-gray-300'}`} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Email</span>
                          <CheckCircle className={`h-4 w-4 ${profile?.email ? 'text-green-500' : 'text-gray-300'}`} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Grade</span>
                          <CheckCircle className={`h-4 w-4 ${profile?.grade ? 'text-green-500' : 'text-gray-300'}`} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Goals</span>
                          <CheckCircle className={`h-4 w-4 ${profile?.goals ? 'text-green-500' : 'text-gray-300'}`} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Learning Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tutorials Completed</span>
                        <span className="font-semibold">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Study Hours</span>
                        <span className="font-semibold">24h</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Streak</span>
                        <span className="font-semibold">7 days</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Notes Created</span>
                        <span className="font-semibold">{notes.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tutorials" className="mt-6">
            <div className="space-y-6">
              {/* Personalized Recommendations */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <Star className="mr-2 h-5 w-5" />
                    Recommended for You
                  </CardTitle>
                  <p className="text-blue-600">
                    Based on your grade level ({profile?.grade || 'Not specified'}) and learning goals
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tutorials.map((tutorial: TutorialItem) => (
                      <Card key={tutorial.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative">
                          <img
                            src={tutorial.videoThumbnail}
                            alt={tutorial.title}
                            className="w-full h-32 object-cover rounded-t-lg"
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              className="bg-white/90 text-gray-900 hover:bg-white"
                              onClick={() => navigate("/tutorials/available")}
                            >
                              <Play className="mr-1 h-3 w-3" />
                              Preview
                            </Button>
                          </div>
                          {tutorial.isPopular && (
                            <Badge className="absolute top-2 left-2 bg-orange-500 text-xs">
                              <TrendingUp className="mr-1 h-2 w-2" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {tutorial.subject}
                            </Badge>
                            <div className="flex items-center text-yellow-500">
                              <Star className="h-3 w-3 fill-current" />
                              <span className="text-xs ml-1">{tutorial.rating}</span>
                            </div>
                          </div>
                          <CardTitle className="text-sm mb-2 line-clamp-2">{tutorial.title}</CardTitle>
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {tutorial.duration}
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {tutorial.views}
                            </span>
                          </div>
                          <div className="flex items-center mb-3">
                            <img
                              src={tutorial.tutorPhoto}
                              alt={tutorial.tutor}
                              className="w-6 h-6 rounded-full mr-2"
                            />
                            <div className="flex-1">
                              <p className="text-xs font-medium text-gray-900">{tutorial.tutor}</p>
                              <p className="text-xs text-gray-500">{tutorial.school}</p>
                            </div>
                          </div>
                          <Button className="w-full" size="sm" onClick={()=>navigate("/tutorials/available")}>
                            <Play className="mr-1 h-3 w-3" />
                            Start Learning
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Continue Learning */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookMarked className="mr-2 h-5 w-5" />
                    Continue Learning
                  </CardTitle>
                  <p className="text-gray-600">Pick up where you left off</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">Mathematics: Algebra Basics</h4>
                        <p className="text-sm text-gray-600">Last watched 2 days ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Progress</div>
                        <div className="text-lg font-semibold">65%</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-semibold">English: Essay Writing</h4>
                        <p className="text-sm text-gray-600">Last watched 1 week ago</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Progress</div>
                        <div className="text-lg font-semibold">30%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tutors" className="mt-6">
            <div className="space-y-6">
              {/* Available Tutors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Available Tutors
                  </CardTitle>
                  <p className="text-gray-600">Expert tutors for your grade level ({profile?.grade || 'Not specified'})</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutors.map(t => (
                      <Card key={t.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="text-center pb-3">
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
                            <Button variant="outline" className="w-full" size="sm">
                              View Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* My Tutors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
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

          <TabsContent value="notes" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="shadow">
                <CardHeader><CardTitle>New Note</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input value={noteTitle} onChange={(e)=>setNoteTitle(e.target.value)} placeholder="Title" className="h-12" />
                  <Textarea value={noteBody} onChange={(e)=>setNoteBody(e.target.value)} placeholder="Write your note..." className="min-h-[200px]" />
                  <Button onClick={addNote}>Save Note</Button>
                </CardContent>
              </Card>
              <Card className="shadow">
                <CardHeader><CardTitle>Preview</CardTitle></CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-2">{noteTitle || 'Untitled'}</h3>
                  <div className="prose max-w-none whitespace-pre-wrap">{notesPreview}</div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {notes.map(n => (
                <Card key={n.id} className="shadow">
                  <CardHeader><CardTitle className="text-lg">{n.title}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="text-sm whitespace-pre-wrap mb-3">{n.body}</div>
                    <Button variant="destructive" onClick={()=>deleteNote(n.id)}>Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LearnerDashboard;


