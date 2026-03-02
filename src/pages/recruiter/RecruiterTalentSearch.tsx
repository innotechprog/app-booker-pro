import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Loader2, Search, User, Briefcase, ExternalLink, UserPlus, MapPin, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterCandidateListItem, type RecruiterRecruitment } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

const RecruiterTalentSearch = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<RecruiterCandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<"all" | "general" | "professional">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [shortlistCandidate, setShortlistCandidate] = useState<RecruiterCandidateListItem | null>(null);
  const [recruitments, setRecruitments] = useState<RecruiterRecruitment[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
      return;
    }
  }, [navigate]);

  const fetchCandidates = useCallback(() => {
    setLoading(true);
    setError(null);
    const cat = category === "all" ? undefined : category;
    recruiterApi
      .getCandidates({
        category: cat,
        search: searchQuery.trim() || undefined,
        skills: skillsFilter.trim() || undefined,
        location: locationFilter.trim() || undefined,
        experience: experienceFilter.trim() || undefined,
      })
      .then((res) => setCandidates(res.candidates || []))
      .catch((err) => setError(err?.message || "Failed to load candidates"))
      .finally(() => setLoading(false));
  }, [category, searchQuery, skillsFilter, locationFilter, experienceFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [category]); // Refetch when category changes

  useEffect(() => {
    if (shortlistOpen) {
      recruiterApi.getRecruitments().then((res) => setRecruitments(res.recruitments || [])).catch(() => setRecruitments([]));
    }
  }, [shortlistOpen]);

  const openShortlist = (c: RecruiterCandidateListItem) => {
    setShortlistCandidate(c);
    setShortlistOpen(true);
  };

  const handleAddToRecruitment = async (recruitmentId: number) => {
    if (!shortlistCandidate) return;
    setAddingId(recruitmentId);
    try {
      await recruiterApi.addCandidateToRecruitment(recruitmentId, shortlistCandidate.id);
      toast({ title: `Added ${shortlistCandidate.fullName} to recruitment` });
      setShortlistOpen(false);
      setShortlistCandidate(null);
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to add", variant: "destructive" });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Search for talent</h1>
          <p className="text-gray-600 mt-1">
            Browse Smart Apply candidates. Filter by skills, location, experience, or search by name.
          </p>
        </div>

        <Card className="mb-6 border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>Search and filter candidates by keywords, skills, location, or experience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Name, email, job title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchCandidates()}
                    className="pl-9 bg-white border-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><Wrench className="h-4 w-4" /> Skills</Label>
                <Input
                  type="text"
                  placeholder="e.g. React, SQL"
                  value={skillsFilter}
                  onChange={(e) => setSkillsFilter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchCandidates()}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Location</Label>
                <Input
                  type="text"
                  placeholder="e.g. Cape Town, Remote"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchCandidates()}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> Experience</Label>
                <Input
                  type="text"
                  placeholder="e.g. Developer, Manager"
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchCandidates()}
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={fetchCandidates}
                disabled={loading}
                className="text-white hover:opacity-90"
                style={{ backgroundColor: DEEP_BLUE }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {" "}Search
              </Button>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={category === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory("all")}
                  className={category === "all" ? "text-white" : "bg-white border-gray-300"}
                  style={category === "all" ? { backgroundColor: DEEP_BLUE } : undefined}
                >
                  All
                </Button>
                <Button
                  variant={category === "general" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory("general")}
                  className={category === "general" ? "text-white" : "bg-white border-gray-300"}
                  style={category === "general" ? { backgroundColor: DEEP_BLUE } : undefined}
                >
                  General
                </Button>
                <Button
                  variant={category === "professional" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory("professional")}
                  className={category === "professional" ? "text-white" : "bg-white border-gray-300"}
                  style={category === "professional" ? { backgroundColor: DEEP_BLUE } : undefined}
                >
                  Professional
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50/50">
            <CardContent className="py-4 text-red-800">{error}</CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : candidates.length === 0 ? (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="py-12 text-center text-gray-600">
              No candidates found. Try a different category or search term.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <Card
                key={c.id}
                className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {c.profilePicture ? (
                          <img
                            src={c.profilePicture.startsWith("data:") ? c.profilePicture : `data:image/jpeg;base64,${c.profilePicture}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">{c.fullName || "—"}</CardTitle>
                        <CardDescription className="text-gray-600">{c.email}</CardDescription>
                      </div>
                    </div>
                    {c.category && (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize shrink-0">
                        {c.category}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {c.phone && (
                    <p className="text-sm text-gray-600 mb-2">Phone: {c.phone}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="text-white hover:opacity-90"
                      style={{ backgroundColor: DEEP_BLUE }}
                    >
                      <Link to={`/recruiter/candidates/${c.id}`} className="inline-flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" /> View profile
                      </Link>
                    </Button>
                    {c.publicCvUrl && (
                      <Button asChild size="sm" variant="outline" className="border-gray-300">
                        <a href={c.publicCvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                          <ExternalLink className="h-4 w-4" /> Online CV
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterTalentSearch;
