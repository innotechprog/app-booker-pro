import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Phone, MapPin, Briefcase, ArrowLeft, ExternalLink, Download, UserPlus } from "lucide-react";
import { recruiterApi, type RecruiterCandidateProfile as ProfileType } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

const RecruiterCandidateProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingCv, setDownloadingCv] = useState(false);

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const numId = id ? parseInt(id, 10) : NaN;
    if (!Number.isFinite(numId)) {
      setError("Invalid candidate id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    recruiterApi
      .getCandidateById(numId)
      .then((res) => setProfile(res.profile))
      .catch((err) => setError(err?.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="py-6">
              <p className="text-red-800 mb-4">{error || "Candidate not found"}</p>
              <Button asChild variant="outline" className="border-gray-300">
                <Link to="/recruiter">Back to talent search</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const p = profile;
  const profilePicUrl = p.profilePicture
    ? (p.profilePicture.startsWith("data:") ? p.profilePicture : `data:image/jpeg;base64,${p.profilePicture}`)
    : null;

  const handleDownloadCv = async () => {
    if (!id || !p.primaryCvId) return;
    setDownloadingCv(true);
    try {
      const blob = await recruiterApi.getCandidateCvBlob(parseInt(id, 10));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(p.fullName || "cv").replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CV download error:", err);
    } finally {
      setDownloadingCv(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-600 hover:text-gray-900">
          <Link to="/recruiter" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to talent search
          </Link>
        </Button>

        <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-gray-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900">{p.fullName || "—"}</CardTitle>
                  {p.jobTitle && (
                    <CardDescription className="text-base text-gray-600 mt-0.5">{p.jobTitle}</CardDescription>
                  )}
                  {p.category && (
                    <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
                      {p.category}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {p.publicCvUrl && (
                  <Button asChild size="sm" variant="outline" className="border-gray-300 text-gray-800 hover:bg-gray-50">
                    <a href={p.publicCvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                      <ExternalLink className="h-4 w-4" /> View online CV
                    </a>
                  </Button>
                )}
                {p.primaryCvId && (
                  <Button
                    size="sm"
                    onClick={handleDownloadCv}
                    disabled={downloadingCv}
                    className="text-white hover:opacity-90"
                    style={{ backgroundColor: DEEP_BLUE }}
                  >
                    {downloadingCv ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {" "}Download CV
                  </Button>
                )}
                <Button asChild variant="outline" size="sm" className="border-gray-300">
                  <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4" /> Contact
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm" className="text-gray-600">
                  <Link to="/recruiter/recruitments" className="inline-flex items-center gap-1.5">
                    <UserPlus className="h-4 w-4" /> Add to recruitment
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <a href={`mailto:${p.email}`} className="inline-flex items-center gap-1.5 text-gray-700 hover:text-gray-900">
                <Mail className="h-4 w-4" /> {p.email}
              </a>
              {p.phone && (
                <span className="inline-flex items-center gap-1.5 text-gray-700">
                  <Phone className="h-4 w-4" /> {p.phone}
                </span>
              )}
              {p.currentLocation && (
                <span className="inline-flex items-center gap-1.5 text-gray-700">
                  <MapPin className="h-4 w-4" /> {p.currentLocation}
                </span>
              )}
            </div>
            {(p.linkedinUrl || p.website) && (
              <div className="flex flex-wrap gap-3">
                {p.linkedinUrl && (
                  <a
                    href={p.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                )}
                {p.website && (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {p.overview && (
          <Card className="border border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{p.overview}</p>
            </CardContent>
          </Card>
        )}

        {p.workExperience && p.workExperience.length > 0 && (
          <Card className="border border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Work experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {p.workExperience.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 border-l-2 border-gray-200 pl-3">
                    {"company" in item && item.company && <span className="font-medium">{String(item.company)}</span>}
                    {"jobTitle" in item && item.jobTitle && (
                      <span className="text-gray-600"> — {String(item.jobTitle)}</span>
                    )}
                    {"startDate" in item && (item.startDate || item.endDate) && (
                      <span className="block text-gray-500 text-xs mt-0.5">
                        {[item.startDate, item.endDate].filter(Boolean).join(" – ")}
                      </span>
                    )}
                    {"description" in item && item.description && (
                      <p className="mt-1 text-gray-600">{String(item.description)}</p>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {p.education && p.education.length > 0 && (
          <Card className="border border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-base">Education</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {p.education.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {"institution" in item && item.institution && <span className="font-medium">{String(item.institution)}</span>}
                    {"qualification" in item && item.qualification && (
                      <span> — {String(item.qualification)}</span>
                    )}
                    {"startDate" in item && (item.startDate || item.endDate) && (
                      <span className="block text-gray-500 text-xs">
                        {[item.startDate, item.endDate].filter(Boolean).join(" – ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {p.keySkills && p.keySkills.length > 0 && (
          <Card className="border border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-base">Key skills</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {p.keySkills.map((item, i) => (
                  <span
                    key={i}
                    className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-700"
                  >
                    {"name" in item ? String(item.name) : JSON.stringify(item)}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {p.certifications && p.certifications.length > 0 && (
          <Card className="border border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-base">Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-gray-700">
                {p.certifications.map((item, i) => (
                  <li key={i}>
                    {"name" in item && item.name ? String(item.name) : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {p.addresses && p.addresses.length > 0 && (
          <Card className="border border-gray-200 bg-white shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                {p.addresses.map((addr) => (
                  <li key={addr.id}>
                    {addr.label && <span className="font-medium">{addr.label}: </span>}
                    {[addr.addressLine1, addr.addressLine2, addr.city, addr.stateRegion, addr.postalCode, addr.country]
                      .filter(Boolean)
                      .join(", ")}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RecruiterCandidateProfile;
