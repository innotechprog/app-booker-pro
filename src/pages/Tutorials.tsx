import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  ArrowRight,
  GraduationCap,
  Calculator,
  Globe,
  Microscope,
  Palette,
  Music,
  Code,
  MapPin,
  Phone,
  Mail
} from "lucide-react";

const Tutorials = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const isLearnerLoggedIn = () => (localStorage.getItem('learnerData') || localStorage.getItem('learner_current')) !== null;
  
  const grades = [
    { id: "grade-1-3", name: "Grades 1-3", level: "Foundation Phase" },
    { id: "grade-4-6", name: "Grades 4-6", level: "Intermediate Phase" },
    { id: "grade-7-9", name: "Grades 7-9", level: "Senior Phase" },
    { id: "grade-10-12", name: "Grades 10-12", level: "FET Phase" },
    { id: "university", name: "University Level", level: "Tertiary Education" }
  ];

  const subjects = [
    { id: "mathematics", name: "Mathematics", icon: Calculator, description: "Algebra, Geometry, Calculus, Statistics" },
    { id: "english", name: "English", icon: BookOpen, description: "Language, Literature, Writing, Comprehension" },
    { id: "science", name: "Natural Sciences", icon: Microscope, description: "Physics, Chemistry, Biology, Earth Sciences" },
    { id: "history", name: "History", icon: Globe, description: "World History, South African History, Geography" },
    { id: "languages", name: "Additional Languages", icon: Globe, description: "Afrikaans, Zulu, French, Spanish, German" }
  ];


  const tutorialPackages = [
    {
      id: "basic",
      name: "Basic Package",
      price: "R150/hour",
      duration: "1-2 hours per session",
      features: ["Individual attention", "Homework help", "Test preparation", "Progress tracking"],
      popular: false
    },
    {
      id: "standard",
      name: "Standard Package",
      price: "R200/hour",
      duration: "2-3 hours per session",
      features: ["Small group sessions (2-4 students)", "Comprehensive curriculum", "Regular assessments", "Parent feedback"],
      popular: true
    },
    {
      id: "premium",
      name: "Premium Package",
      price: "R300/hour",
      duration: "3-4 hours per session",
      features: ["One-on-one tutoring", "Customized learning plan", "Exam preparation", "24/7 support"],
      popular: false
    }
  ];

  const handleShowTutorials = () => {
    if (selectedGrade && selectedSubject) {
      navigate("/tutorials/available", { 
        state: { 
          grade: grades.find(g => g.id === selectedGrade)?.name,
          subject: subjects.find(s => s.id === selectedSubject)?.name
        } 
      });
    }
  };


  return (
    <div className="min-h-screen">
      <SEO page="tutorials" />
      
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          {!isLearnerLoggedIn() && (
            <div className="flex justify-end mb-4">
              <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <Link to="/learner/login">Login</Link>
              </Button>
            </div>
          )}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">Online Tutorials</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Get personalized tutoring for any grade and subject. Our expert tutors help you excel in your studies with flexible scheduling and comprehensive support.
            </p>
            <div className="mt-6 flex items-center justify-center space-x-4 text-white/80">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">All Grades (1-12 + University)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">10+ Subjects</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm font-medium">Expert Tutors</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade and Subject Selection */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Grade & Subject</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select your grade level and the subject you need help with to find the perfect tutorial package
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Grade Selection */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  <span>Select Grade</span>
                </CardTitle>
                <CardDescription>
                  Choose your current grade level or education phase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your grade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{grade.name}</span>
                          <span className="text-sm text-gray-500">{grade.level}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Subject Selection */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span>Select Subject</span>
                </CardTitle>
                <CardDescription>
                  Choose the subject you need tutoring in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose your subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => {
                      const IconComponent = subject.icon;
                      return (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center space-x-3">
                            <IconComponent className="h-4 w-4" />
                            <div className="flex flex-col">
                              <span className="font-medium">{subject.name}</span>
                              <span className="text-sm text-gray-500">{subject.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Show Tutorials Button */}
          <div className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:!bg-gradient-to-r hover:!from-blue-800 hover:!to-purple-800 text-white hover:!text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleShowTutorials}
              disabled={!selectedGrade || !selectedSubject}
            >
              <span>View Available Tutorials</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {(!selectedGrade || !selectedSubject) && (
              <p className="text-gray-500 mt-2 text-sm">
                Please select both grade and subject to continue
              </p>
            )}
          </div>
        </div>
      </div>


      {/* Tutorial Packages */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tutorial Packages</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the package that best fits your learning needs and budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tutorialPackages.map((pkg) => (
              <Card key={pkg.id} className={`relative shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${pkg.popular ? 'ring-2 ring-blue-500' : ''} bg-gray-900 text-white`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-100">{pkg.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-blue-300">{pkg.price}</span>
                    <p className="text-gray-300 mt-1">{pkg.duration}</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-100">What's Included:</h4>
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:!bg-gradient-to-r hover:!from-blue-800 hover:!to-purple-800 text-white hover:!text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => {
                      if (selectedGrade && selectedSubject) {
                        handleBookTutorial();
                      } else {
                        navigate("/tutorials");
                      }
                    }}
                  >
                    <span>Choose This Package</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Need Help Choosing?</h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Our education specialists are here to help you find the perfect tutorial solution for your needs.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
              <Phone className="mr-2 h-4 w-4" />
              Call Us
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 hover:border-white px-8 py-3 rounded-xl transition-all duration-300">
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      {!isLearnerLoggedIn() && <Footer />}
    </div>
  );
};

export default Tutorials;
