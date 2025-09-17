import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { ArrowLeft, Search, Star, Clock, Users, MapPin, Eye } from "lucide-react";

interface TutorialItem {
  id: number;
  title: string;
  duration: string;
  difficulty: string;
  school: string;
  tutor: string;
  rating: number;
  topics: string[];
  views: number;
}

const mockTutorials: TutorialItem[] = [
  { id: 1, title: "Introduction to Algebra", duration: "45 min", difficulty: "Beginner", school: "University of Cape Town", tutor: "Dr. Sarah Johnson", rating: 4.9, topics: ["algebra", "variables", "equations"], views: 1250 },
  { id: 2, title: "Quadratic Equations", duration: "60 min", difficulty: "Intermediate", school: "University of the Witwatersrand", tutor: "Prof. Michael Chen", rating: 4.8, topics: ["quadratic", "parabola", "factorisation"], views: 980 },
  { id: 3, title: "Advanced Calculus", duration: "90 min", difficulty: "Advanced", school: "Stellenbosch University", tutor: "Dr. Emma Williams", rating: 4.9, topics: ["calculus", "derivatives", "integrals", "limits"], views: 2100 },
  { id: 4, title: "Statistics and Probability", duration: "75 min", difficulty: "Intermediate", school: "University of Pretoria", tutor: "Prof. David Brown", rating: 4.7, topics: ["statistics", "probability", "distributions"], views: 1650 },
  { id: 5, title: "Functions & Graphs", duration: "55 min", difficulty: "Intermediate", school: "University of Cape Town", tutor: "Dr. Sarah Johnson", rating: 4.8, topics: ["functions", "graphs", "transformations"], views: 1190 },
  { id: 6, title: "Trigonometry Basics", duration: "50 min", difficulty: "Beginner", school: "University of the Witwatersrand", tutor: "Prof. Michael Chen", rating: 4.6, topics: ["trigonometry", "sine", "cosine", "angles"], views: 860 },
];

const AvailableTutorials = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { grade?: string; subject?: string } };
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = useMemo(() => {
    const tokens = query
      .split(/[,\s]+/)
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
    if (tokens.length === 0) return mockTutorials;
    return mockTutorials.filter(t => {
      const fields = [
        t.title.toLowerCase(),
        t.tutor.toLowerCase(),
        t.school.toLowerCase(),
        ...t.topics.map(tp => tp.toLowerCase())
      ];
      // AND: every token must match at least one field
      return tokens.every(tok => fields.some(f => f.includes(tok)));
    });
  }, [query]);

  // Build suggestion list from current query across title, tutor, school, topics
  const suggestions = useMemo(() => {
    const raw = query;
    const endedWithSpace = /\s$/.test(raw);
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    const current = endedWithSpace ? '' : (parts[parts.length - 1] || '');
    const pool: string[] = [];
    // Build a pool of all possible suggestion strings
    mockTutorials.forEach(t => {
      pool.push(t.title, t.tutor, t.school, ...t.topics);
    });
    // unique preserve order
    const seenAll = new Set<string>();
    const allUnique = pool.filter(v => { if (seenAll.has(v)) return false; seenAll.add(v); return true; });
    // If current token is empty, show generic top suggestions
    if (!current) {
      return allUnique.slice(0, 8);
    }
    // Otherwise, filter by current partial token
    const lc = current.toLowerCase();
    const filtered = allUnique.filter(v => v.toLowerCase().includes(lc));
    return filtered.slice(0, 8);
  }, [query]);

  // Replace the last partial token with the chosen token; if user ended with a space, append.
  const applyToken = (token: string) => {
    const raw = query;
    const endedWithSpace = /\s$/.test(raw);
    const parts = raw.split(/[\s,]+/).filter(Boolean);
    // If duplicate, still replace last partial to clean it up
    if (parts.length === 0) {
      setQuery(token + ' ');
      setShowSuggestions(false);
      return;
    }
    if (endedWithSpace) {
      const next = (raw + token + ' ').replace(/\s+/g, ' ');
      setQuery(next.trimStart());
      setShowSuggestions(false);
      return;
    }
    const newParts = [...parts];
    newParts[newParts.length - 1] = token;
    const next = newParts.join(' ') + ' ';
    setQuery(next);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen">
      <SEO page="tutorials" />

      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Available Tutorials</h1>
              {(state?.grade || state?.subject) && (
                <p className="text-white/70 text-sm">{state?.subject} • {state?.grade}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Search by teacher, school, title, or topic..."
                className="pl-12 h-12 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-xl shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-800"
                      onMouseDown={() => applyToken(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {query && (
              <>
                <p className="text-sm text-gray-500 mt-2">Showing {filtered.length} of {mockTutorials.length} tutorials</p>
                {/* Visible filter tokens with borders */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {query
                    .split(/[\s,]+/)
                    .map(t => t.trim())
                    .filter(Boolean)
                    .map((tok, idx) => (
                      <Badge key={`${tok}-${idx}`} variant="outline" className="border border-gray-300 text-gray-700 bg-white">
                        {tok}
                      </Badge>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-4 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No tutorials match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(t => (
              <Card key={t.id} className={`transition-shadow hover:shadow-lg bg-white`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 cursor-pointer hover:underline" onClick={() => applyToken(t.title)}>{t.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="border-gray-300 text-gray-700">{t.difficulty}</Badge>
                        <div className="flex items-center space-x-1 text-gray-700">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{t.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-800">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <button type="button" className="text-left hover:underline" onClick={() => applyToken(t.tutor)}>{t.tutor}</button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <button type="button" className="text-left hover:underline" onClick={() => applyToken(t.school)}>{t.school}</button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{t.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>{t.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {t.topics.map((topic) => (
                      <button key={topic} type="button" onClick={() => applyToken(topic)}>
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 hover:bg-gray-100">
                          {topic}
                        </Badge>
                      </button>
                    ))}
                  </div>
                  
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AvailableTutorials;


