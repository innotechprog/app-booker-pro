import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { Loader2, ArrowLeft, UserPlus, Trash2, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterRecruitment, type RecruiterCandidateListItem } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

const RecruiterRecruitmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recruitment, setRecruitment] = useState<RecruiterRecruitment | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [candidatesList, setCandidatesList] = useState<RecruiterCandidateListItem[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const recruitmentId = id ? parseInt(id, 10) : NaN;

  const loadRecruitment = () => {
    if (!Number.isFinite(recruitmentId)) return;
    recruiterApi
      .getRecruitment(recruitmentId)
      .then((res) => setRecruitment(res.recruitment))
      .catch((err) => {
        if (err?.message === "Session expired" || !recruiterApi.hasToken()) navigate("/recruiter/sign-in");
        else navigate("/recruiter/recruitments");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
      return;
    }
    if (!Number.isFinite(recruitmentId)) {
      navigate("/recruiter/recruitments");
      return;
    }
    loadRecruitment();
  }, [navigate, recruitmentId]);

  useEffect(() => {
    if (addOpen) {
      recruiterApi.getCandidates().then((res) => setCandidatesList(res.candidates || [])).catch(() => setCandidatesList([]));
    }
  }, [addOpen]);

  const alreadyInRecruitment = (candidateId: number) =>
    recruitment?.candidates?.some((c) => c.id === candidateId) ?? false;

  const handleAddCandidate = async (candidateId: number) => {
    setAddingId(candidateId);
    try {
      await recruiterApi.addCandidateToRecruitment(recruitmentId, candidateId);
      loadRecruitment();
      toast({ title: "Candidate added" });
      setAddOpen(false);
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to add", variant: "destructive" });
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveCandidate = async (candidateId: number) => {
    setRemovingId(candidateId);
    try {
      await recruiterApi.removeCandidateFromRecruitment(recruitmentId, candidateId);
      loadRecruitment();
      toast({ title: "Candidate removed" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to remove", variant: "destructive" });
    } finally {
      setRemovingId(null);
    }
  };

  if (loading || !recruitment) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      </Layout>
    );
  }

  const inIds = new Set((recruitment.candidates || []).map((c) => c.id));
  const availableToAdd = candidatesList.filter((c) => !inIds.has(c.id));

  return (
    <Layout>
      <SEO title={`${recruitment.name} – Recruiter`} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-600">
            <Link to="/recruiter/recruitments" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to recruitments
            </Link>
          </Button>

          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">{recruitment.name}</CardTitle>
              {recruitment.description && (
                <CardDescription className="whitespace-pre-wrap">{recruitment.description}</CardDescription>
              )}
            </CardHeader>
          </Card>

          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Candidates in this recruitment</h2>
            <Button
              onClick={() => setAddOpen(true)}
              size="sm"
              className="text-white hover:opacity-90 inline-flex items-center gap-2"
              style={{ backgroundColor: DEEP_BLUE }}
            >
              <UserPlus className="h-4 w-4" /> Add candidate
            </Button>
          </div>

          {(recruitment.candidates?.length ?? 0) === 0 ? (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="py-12 text-center text-gray-600">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No candidates yet. Add candidates from the talent pool.</p>
                <Button
                  onClick={() => setAddOpen(true)}
                  className="mt-4 text-white hover:opacity-90"
                  style={{ backgroundColor: DEEP_BLUE }}
                >
                  Add candidate
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {(recruitment.candidates || []).map((c) => (
                <Card key={c.id} className="border border-gray-200 bg-white shadow-sm">
                  <CardContent className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.fullName}</p>
                        <p className="text-sm text-gray-600">{c.email}</p>
                      </div>
                      {c.category && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{c.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="border-gray-300">
                        <Link to={`/recruiter/candidates/${c.id}`}>View profile</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        disabled={removingId === c.id}
                        onClick={() => handleRemoveCandidate(c.id)}
                      >
                        {removingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add candidate</DialogTitle>
            <DialogDescription>Choose a candidate from the talent pool to add to this recruitment.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {availableToAdd.length === 0 ? (
              <p className="text-sm text-gray-500">All candidates are already in this recruitment, or there are no candidates yet.</p>
            ) : (
              availableToAdd.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{c.fullName}</p>
                    <p className="text-sm text-gray-600">{c.email}</p>
                  </div>
                  <Button
                    size="sm"
                    disabled={addingId === c.id}
                    className="text-white shrink-0"
                    style={{ backgroundColor: DEEP_BLUE }}
                    onClick={() => handleAddCandidate(c.id)}
                  >
                    {addingId === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RecruiterRecruitmentDetail;
