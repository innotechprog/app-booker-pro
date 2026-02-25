import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Crown, Zap, Bell, CheckCircle2, XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI } from "@/services/api";

const DEEP_BLUE = "#1e3a5f";

interface PremiumPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency?: string;
  description?: string;
}

interface AutoApplyMatch {
  id: string;
  jobTitle: string;
  companyName?: string;
  jobId?: string;
  matchedAt?: string;
  status?: "pending" | "accepted" | "declined";
}

const FALLBACK_PACKAGES: PremiumPackage[] = [
  { id: "starter", name: "Starter", credits: 5, price: 199, currency: "ZAR", description: "5 auto-apply credits" },
  { id: "growth", name: "Growth", credits: 15, price: 499, currency: "ZAR", description: "15 credits (save 17%)" },
  { id: "pro", name: "Pro", credits: 30, price: 899, currency: "ZAR", description: "30 credits (save 25%)" },
];

const SmartApplyPremium = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [packages, setPackages] = useState<PremiumPackage[]>([]);
  const [matches, setMatches] = useState<AutoApplyMatch[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [actingMatchId, setActingMatchId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply/sign-in");
      return;
    }
    setLoading(true);
    Promise.all([
      smartApplyAPI.getCredits(),
      smartApplyAPI.getPremiumPackages(),
      smartApplyAPI.getAutoApplyMatches(),
    ])
      .then(([creditsRes, packagesRes, matchesRes]) => {
        setCredits((creditsRes as { credits?: number }).credits ?? 0);
        const pkgList = (packagesRes as { packages?: PremiumPackage[] }).packages ?? [];
        setPackages(pkgList.length > 0 ? pkgList : FALLBACK_PACKAGES);
        setMatches((matchesRes as { matches?: AutoApplyMatch[] }).matches ?? []);
      })
      .catch(() => {
        setCredits(0);
        setPackages(FALLBACK_PACKAGES);
        setMatches([]);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const refreshCreditsAndMatches = () => {
    smartApplyAPI.getCredits().then((r) => setCredits((r as { credits?: number }).credits ?? 0)).catch(() => {});
    smartApplyAPI.getAutoApplyMatches().then((r) => setMatches((r as { matches?: AutoApplyMatch[] }).matches ?? [])).catch(() => setMatches([]));
  };

  // From credits, take user into a dedicated billing / checkout flow
  const handlePurchase = (pkg: PremiumPackage) => {
    setPurchasingId(pkg.id);
    navigate("/smart-apply/billing", { state: { pkg } });
  };

  const handleAccept = async (matchId: string) => {
    setActingMatchId(matchId);
    try {
      await smartApplyAPI.acceptAutoApplyMatch(matchId);
      refreshCreditsAndMatches();
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
        <SEO title="Premium – Smart Apply" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-amber-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Premium – Smart Apply" />
      <div className="min-h-screen bg-gray-100">
        {/* Page header banner */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Button asChild variant="ghost" size="sm" className="mb-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100">
              <Link to="/smart-apply/dashboard" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Crown className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Upgrade to Premium</h1>
                <p className="text-gray-700 text-sm mt-0.5">
                  Buy credits for auto-apply. Get notified when jobs match your profile — accept to apply (1 credit) or decline.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Credits balance */}
          <Card className="mb-8 border-2 border-amber-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <CreditCard className="h-5 w-5 text-amber-600" />
                Your credits
              </CardTitle>
              <CardDescription className="text-gray-700">
                One credit is used each time you accept an auto-apply match.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">
                {credits} <span className="text-xl font-normal text-gray-600">credits</span>
              </p>
            </CardContent>
          </Card>

          {/* Purchase packages */}
          <Card className="mb-8 border-2 border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-900">Purchase credits</CardTitle>
              <CardDescription className="text-gray-700">
                Choose a package. Credits do not expire and are only used when you accept a matched job.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 sm:grid-cols-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="rounded-xl border-2 border-gray-200 bg-gray-50 p-5 flex flex-col shadow-sm"
                  >
                    <p className="font-bold text-gray-900 text-lg">{pkg.name}</p>
                    <p className="text-2xl font-bold mt-2 text-gray-900">
                      {pkg.currency ?? "ZAR"} {pkg.price}
                    </p>
                    <p className="text-sm font-medium text-gray-700 mt-1">{pkg.credits} credits</p>
                    {pkg.description && (
                      <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                    )}
                    <Button
                      className="mt-5 text-white font-semibold hover:opacity-90"
                      style={{ backgroundColor: DEEP_BLUE }}
                      disabled={!!purchasingId}
                      onClick={() => handlePurchase(pkg)}
                    >
                      {purchasingId === pkg.id ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>
                      ) : (
                        "Buy now"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-5">
                Payment is handled securely. If the purchase button does not complete a real payment, the backend may not be configured yet.
              </p>
            </CardContent>
          </Card>

          {/* Auto-apply matches (notifications) */}
          <Card className="border-2 border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Bell className="h-5 w-5 text-amber-600" />
                Auto-apply matches
              </CardTitle>
              <CardDescription className="text-gray-700">
                Jobs that match your profile. Accept to submit your application (uses 1 credit) or decline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="py-10 text-center">
                  <Zap className="h-14 w-14 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-700 font-medium">No new matches right now</p>
                  <p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto">
                    We’ll notify you here when a posted job matches your profile. Keep your profile and CV up to date for more matches.
                  </p>
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

export default SmartApplyPremium;
