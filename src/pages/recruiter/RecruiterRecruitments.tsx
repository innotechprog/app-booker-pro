import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Briefcase, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterRecruitment } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

const RecruiterRecruitments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recruitments, setRecruitments] = useState<RecruiterRecruitment[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
      return;
    }
    recruiterApi
      .getRecruitments()
      .then((res) => setRecruitments(res.recruitments || []))
      .catch((err) => {
        if (err?.message === "Session expired" || !recruiterApi.hasToken()) navigate("/recruiter/sign-in");
        else toast({ title: err?.message || "Failed to load recruitments", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setCreating(true);
    try {
      const res = await recruiterApi.createRecruitment({ name: createName.trim(), description: createDesc.trim() || undefined });
      setRecruitments((prev) => [res.recruitment as RecruiterRecruitment, ...prev]);
      setCreateOpen(false);
      setCreateName("");
      setCreateDesc("");
      toast({ title: "Recruitment created" });
      if (res.recruitment?.id) navigate(`/recruiter/recruitments/${res.recruitment.id}`);
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to create", variant: "destructive" });
    } finally {
      setCreating(false);
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

  return (
    <Layout>
      <SEO title="Recruitments – Recruiter" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-600">
            <Link to="/recruiter" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recruitments</h1>
              <p className="text-gray-600 mt-1">Create recruitments and add candidates to each.</p>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="text-white hover:opacity-90 inline-flex items-center gap-2"
              style={{ backgroundColor: DEEP_BLUE }}
            >
              <Plus className="h-4 w-4" /> New recruitment
            </Button>
          </div>

          {recruitments.length === 0 ? (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="py-12 text-center text-gray-600">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No recruitments yet. Create one to start adding candidates.</p>
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="mt-4 text-white hover:opacity-90"
                  style={{ backgroundColor: DEEP_BLUE }}
                >
                  Create recruitment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recruitments.map((r) => (
                <Card key={r.id} className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          <Link to={`/recruiter/recruitments/${r.id}`} className="hover:underline">
                            {r.name}
                          </Link>
                        </CardTitle>
                        {r.description && (
                          <CardDescription className="mt-1 line-clamp-2">{r.description}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-4 w-4" /> {r.candidateCount ?? 0} candidates
                        </span>
                        <Button asChild size="sm" variant="outline" className="border-gray-300">
                          <Link to={`/recruiter/recruitments/${r.id}`}>Open</Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New recruitment</DialogTitle>
            <DialogDescription>Give this recruitment a name and optional description.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Backend roles Q1"
                required
                className="mt-1 bg-white border-gray-300"
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Short description"
                className="mt-1 bg-white border-gray-300"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="text-white" style={{ backgroundColor: DEEP_BLUE }}>
                {creating ? "Creating…" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RecruiterRecruitments;
