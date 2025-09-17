import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { ArrowLeft, Search, Star, Clock, Users, MapPin, CheckCircle } from "lucide-react";

interface TutorialItem {
  id: number;
  title: string;
  duration: string;
  difficulty: string;
  school: string;
  tutor: string;
  rating: number;
  topics: string[];
}

const mockTutorials: TutorialItem[] = [
  { id: 1, title: "Introduction to Algebra", duration: "45 min", difficulty: "Beginner", school: "University of Cape Town", tutor: "Dr. Sarah Johnson", rating: 4.9, topics: ["algebra", "variables", "equations"] },
  { id: 2, title: "Quadratic Equations", duration: "60 min", difficulty: "Intermediate", school: "University of the Witwatersrand", tutor: "Prof. Michael Chen", rating: 4.8, topics: ["quadratic", "parabola", "factorisation"] },
  { id: 3, title: "Advanced Calculus", duration: "90 min", difficulty: "Advanced", school: "Stellenbosch University", tutor: "Dr. Emma Williams", rating: 4.9, topics: ["calculus", "derivatives", "integrals", "limits"] },
  { id: 4, title: "Statistics and Probability", duration: "75 min", difficulty: "Intermediate", school: "University of Pretoria", tutor: "Prof. David Brown", rating: 4.7, topics: ["statistics", "probability", "distributions"] },
  { id: 5, title: "Functions & Graphs", duration: "55 min", difficulty: "Intermediate", school: "University of Cape Town", tutor: "Dr. Sarah Johnson", rating: 4.8, topics: ["functions", "graphs", "transformations"] },
  { id: 6, title: "Trigonometry Basics", duration: "50 min", difficulty: "Beginner", school: "University of the Witwatersrand", tutor: "Prof. Michael Chen", rating: 4.6, topics: ["trigonometry", "sine", "cosine", "angles"] },
];

const AvailableTutorials = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { grade?: string; subject?: string } };
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockTutorials;
    return mockTutorials.filter(t =>
      t.tutor.toLowerCase().includes(q) ||
      t.school.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.topics.some(topic => topic.toLowerCase().includes(q))
    );
  }, [query]);

  // Build suggestion list from current query across title, tutor, school, topics
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as string[];
    const pool: string[] = [];
    mockTutorials.forEach(t => {
      if (t.title.toLowerCase().includes(q)) pool.push(t.title);
      if (t.tutor.toLowerCase().includes(q)) pool.push(t.tutor);
      if (t.school.toLowerCase().includes(q)) pool.push(t.school);
      t.topics.forEach(tp => { if (tp.toLowerCase().includes(q)) pool.push(tp); });
    });
    // unique, keep order, limit
    const seen = new Set<string>();
    const unique = pool.filter(v => { if (seen.has(v)) return false; seen.add(v); return true; });
    return unique.slice(0, 8);
  }, [query]);

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
                      onClick={() => { setQuery(s); setShowSuggestions(false); }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {query && (
              <p className="text-sm text-gray-500 mt-2">Showing {filtered.length} of {mockTutorials.length} tutorials</p>
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
                      <CardTitle className="text-xl font-bold text-gray-900">{t.title}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="border-gray-300 text-gray-700">{t.difficulty}</Badge>
                        <div className="flex items-center space-x-1 text-gray-700">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{t.rating}</span>
                        </div>
                      </div>
                    </div>
                    {isSelected(t.id) && (
                      <Badge className="bg-blue-600 text-white">Selected</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-gray-800">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>{t.tutor}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{t.school}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{t.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {t.topics.map((topic) => (
                      <Badge key={topic} variant="outline" className="text-xs border-gray-300 text-gray-700">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  {isSelected(t.id) && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Included in your selection</span>
                    </div>
                  )}
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


