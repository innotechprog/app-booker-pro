import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, CheckCircle2, XCircle, ArrowLeft, Zap, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI } from "@/services/api";

const DEEP_BLUE = "#1e3a5f";

interface AutoApplyMatch {
  id: string;
  jobTitle: string;
  companyName?: string;
  jobId?: string;
  matchedAt?: string;
  status?: "pending" | "accepted" | "declined";
}

const SmartApplyNotifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [matches, setMatches] = useState<AutoApplyMatch[]>([]);
  const [actingMatchId, setActingMatchId] = useState<string | null>(null);

  const loadData = () => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply/sign-in");
      return;
    }
    Promise.all([smartApplyAPI.getCredits(), smartApplyAPI.getAutoApplyMatches()])
      .then(([creditsRes, matchesRes]) => {
        setCredits((creditsRes as { credits?: number }).credits ?? 0);
        setMatches((matchesRes as { matches?: AutoApplyMatch[] }).matches ?? []);
      })
      .catch(() => {
        setCredits(0);
        setMatches([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const handleAccept = async (matchId: string) => {
    setActingMatchId(matchId);
    try {
      await smartApplyAPI.acceptAutoApplyMatch(matchId);
      loadData();
      toast({ title: "Application sent", description: "One credit was used. Your application has been submitted." });
    } catch (err) {
      toast({
        title: "Could not accept",
        description: err instanceof Error ? err.message : "Not enough credits or server error.",
        variant: "destructive",
      });
    } finally {
      setActingMatchId(null);
    }
  };

  const handleDecline = async (matchId: string) => {
    setActingMatchId(matchId);
    try {
      await smartApplyAPI.declineAutoApplyMatch(matchId);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      toast({ title: "Declined", description: "You will not be applied to this job." });
    } catch (err) {
      toast({
        title: "Could not decline",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setActingMatchId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <SEO title="Notifications – Smart Apply" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Notifications – Smart Apply" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-700 hover:text-gray-900">
            <Link to="/smart-apply/dashboard" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Bell className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 text-sm mt-0.5">Matching jobs — accept to apply (1 credit) or decline</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">{credits} credits</span>
            </div>
          </div>

          <Card className="border-2 border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-900">Matching jobs</CardTitle>
              <CardDescription className="text-gray-700">
                Jobs that match your profile. Accept to submit your application using 1 credit, or decline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="py-12 text-center">
                  <Zap className="h-14 w-14 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-700 font-medium">No matching jobs right now</p>
                  <p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto">
                    We’ll notify you here when a posted job matches your profile. Keep your profile and CV up to date.
                  </p>
                  <Button asChild className="mt-4 text-white" style={{ backgroundColor: DEEP_BLUE }}>
                    <Link to="/smart-apply/premium">Get credits for auto-apply</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {matches.map((match) => (
                    <li
                      key={match.id}
                      className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border-2 border-gray-200 bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{match.jobTitle}</p>
                        {match.companyName && (
                          <p className="text-sm text-gray-700 mt-0.5">{match.companyName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-medium"
                          disabled={!!actingMatchId || credits < 1}
                          onClick={() => handleAccept(match.id)}
                        >
                          {actingMatchId === match.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1.5" />
                              Accept (1 credit)
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-400 bg-white text-gray-800 font-medium hover:bg-gray-50"
                          disabled={!!actingMatchId}
                          onClick={() => handleDecline(match.id)}
                        >
                          {actingMatchId === match.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 mr-1.5" />
                              Decline
                            </>
                          )}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyNotifications;
