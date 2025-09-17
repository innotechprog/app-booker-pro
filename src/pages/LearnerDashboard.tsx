import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Notes
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const notesPreview = useMemo(()=> noteBody, [noteBody]);

  useEffect(()=>{
    const c = localStorage.getItem("learner_current");
    if (!c) { navigate("/learner/login"); return; }
    const { email } = JSON.parse(c);
    setCurrent({ email });
    const learners = JSON.parse(localStorage.getItem("learners") || "[]");
    const p = learners.find((l: any)=> l.email === email);
    setProfile(p);
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

  // Mock tutorials/tutors by grade
  const tutorials = useMemo(()=>{
    const g = profile?.grade || "";
    return [
      { id: 1, title: `Algebra Basics (${g})`, subject: "Mathematics" },
      { id: 2, title: `Comprehension Skills (${g})`, subject: "English" },
      { id: 3, title: `Natural Sciences Intro (${g})`, subject: "Science" },
    ];
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Learner Portal</h1>
          <div className="space-x-2">
            <Button variant="outline" onClick={()=>navigate("/tutorials/available")}>Browse Tutorials</Button>
            <Button onClick={()=>{ localStorage.removeItem("learner_current"); navigate("/learner/login"); }}>Logout</Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="tutors">Tutors</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card className="shadow">
              <CardHeader><CardTitle>My Profile</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input value={profile?.fullName || ''} onChange={(e)=>setProfile((p:any)=>({...p, fullName: e.target.value}))} placeholder="Full name" className="h-12" />
                  <Input value={profile?.email || ''} disabled className="h-12" />
                  <Input value={profile?.password || ''} onChange={(e)=>setProfile((p:any)=>({...p, password: e.target.value}))} type="password" placeholder="Password" className="h-12" />
                  <Input value={profile?.grade || ''} onChange={(e)=>setProfile((p:any)=>({...p, grade: e.target.value}))} placeholder="Grade (e.g., grade-10)" className="h-12" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveProfile}>Save</Button>
                  <Button variant="destructive" onClick={deleteProfile}>Delete Profile</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tutorials" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tutorials.map(t => (
                <Card key={t.id} className="shadow">
                  <CardHeader><CardTitle className="text-lg">{t.title}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Subject: {t.subject}</p>
                    <Button className="mt-3">Watch</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tutors" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tutors.map(t => (
                <Card key={t.id} className="shadow">
                  <CardHeader><CardTitle className="text-lg">{t.name}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{t.subject} • {t.grade}</p>
                    <Button className="mt-3" variant="outline">Contact</Button>
                  </CardContent>
                </Card>
              ))}
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


