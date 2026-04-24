import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, UserPlus, Trash2, User, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterRecruitment, type RecruiterCandidateListItem } from "@/services/recruiterApi";
import { RECRUITER_BUTTON_PRIMARY } from "@/features/recruiter/buttonStyles";

const DEEP_BLUE = "#1e3a5f";

const RecruiterRecruitmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recruitment, setRecruitment] = useState<RecruiterRecruitment | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [candidatesList, setCandidatesList] = useState<RecruiterCandidateListItem[]>([]);
  const [addSearch, setAddSearch] = useState("");
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
      setAddSearch("");
      recruiterApi.getCandidates().then((res) => setCandidatesList(res.candidates || [])).catch(() => setCandidatesList([]));
    }
  }, [addOpen]);

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
  const filteredAvailableToAdd = availableToAdd.filter((c) => {
    const q = addSearch.trim().toLowerCase();
    if (!q) return true;
    return [c.fullName, c.email, c.jobTitle || "", c.category || ""].some((v) =>
      String(v).toLowerCase().includes(q),
    );
  });

  return (
    <Layout>
      <SEO title={`${recruitment.name} - Recruiter`} />
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
              className={`${RECRUITER_BUTTON_PRIMARY} inline-flex items-center gap-2`}
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
                  className={`mt-4 ${RECRUITER_BUTTON_PRIMARY}`}
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
                        {c.jobTitle && (
                          <p className="text-xs text-gray-500 mt-0.5">{c.jobTitle}</p>
                        )}
                      </div>
                      {c.category && (
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">{c.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      >
                        <Link to={`/recruiter/candidates/${c.id}`}>View profile</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add candidate</DialogTitle>
            <DialogDescription>Choose a candidate from the talent pool to add to this recruitment.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              placeholder="Search by name, email, title, or category"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {filteredAvailableToAdd.length === 0 ? (
              <p className="text-sm text-gray-500">All candidates are already in this recruitment, or there are no candidates yet.</p>
            ) : (
              filteredAvailableToAdd.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 p-2"
                >
                  <div>
                    <p className="font-medium text-gray-900">{c.fullName}</p>
                    <p className="text-sm text-gray-600">{c.email}</p>
                    {c.jobTitle && <p className="text-xs text-gray-500">{c.jobTitle}</p>}
                  </div>
                  <Button
                    size="sm"
                    disabled={addingId === c.id}
                    className={`${RECRUITER_BUTTON_PRIMARY} shrink-0`}
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

export default RecruiterRecruitmentDetailPage;
