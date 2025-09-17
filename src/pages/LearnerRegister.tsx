import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEO from "@/components/SEO";

const grades = [
  { id: "grade-1", name: "Grade 1" },
  { id: "grade-2", name: "Grade 2" },
  { id: "grade-3", name: "Grade 3" },
  { id: "grade-4", name: "Grade 4" },
  { id: "grade-5", name: "Grade 5" },
  { id: "grade-6", name: "Grade 6" },
  { id: "grade-7", name: "Grade 7" },
  { id: "grade-8", name: "Grade 8" },
  { id: "grade-9", name: "Grade 9" },
  { id: "grade-10", name: "Grade 10" },
  { id: "grade-11", name: "Grade 11" },
  { id: "grade-12", name: "Grade 12" },
  { id: "university", name: "University" }
];

const LearnerRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    grade: "",
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const learners = JSON.parse(localStorage.getItem("learners") || "[]");
    learners.push({ ...form, id: Date.now() });
    localStorage.setItem("learners", JSON.stringify(learners));
    localStorage.setItem("learner_current", JSON.stringify({ email: form.email }));
    navigate("/learner");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Learner Register" />
      <div className="max-w-md mx-auto px-4 py-12">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Create Learner Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <Input placeholder="Full name" value={form.fullName} onChange={(e)=>setForm(f=>({...f, fullName: e.target.value}))} required className="h-12" />
              </div>
              <div>
                <Input type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm(f=>({...f, email: e.target.value}))} required className="h-12" />
              </div>
              <div>
                <Input type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm(f=>({...f, password: e.target.value}))} required className="h-12" />
              </div>
              <div>
                <Select value={form.grade} onValueChange={(v)=>setForm(f=>({...f, grade: v}))}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(g=> <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-12">Register</Button>
            </form>
            <p className="text-sm text-gray-600 mt-4">Already have an account? <Link to="/learner/login" className="text-blue-600 hover:underline">Login</Link></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LearnerRegister;


