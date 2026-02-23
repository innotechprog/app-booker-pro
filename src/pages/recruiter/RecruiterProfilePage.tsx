import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterProfile } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

const RecruiterProfilePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
      return;
    }
    recruiterApi
      .getProfile()
      .then((res) => {
        setProfile(res.profile);
        setFullName(res.profile.fullName || "");
        setCompany(res.profile.company || "");
        setPhone(res.profile.phone || "");
      })
      .catch((err) => {
        if (err?.message === "Session expired" || !recruiterApi.hasToken()) navigate("/recruiter/sign-in");
        else toast({ title: err?.message || "Failed to load profile", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recruiterApi.saveProfile({ fullName, company, phone });
      toast({ title: "Profile updated" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      </Layout>
    );
  }

  if (!profile) return null;

  return (
    <Layout>
      <SEO title="Profile – Recruiter" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-600">
            <Link to="/recruiter" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Recruiter profile</h1>
            <p className="text-gray-600 mt-1">Update your details.</p>
          </div>
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" /> Your details
              </CardTitle>
              <CardDescription>Email is your login and cannot be changed.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={profile.email} readOnly className="mt-1 bg-gray-50 border-gray-300" />
                </div>
                <div>
                  <Label>Full name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <Button type="submit" disabled={saving} className="text-white hover:opacity-90" style={{ backgroundColor: DEEP_BLUE }}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RecruiterProfilePage;
