import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AccessLevel, canAccess } from "@/utils/accessControl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import {
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Globe,
  ArrowRight,
  Star,
  Clock,
  MapPin,
  CheckCircle,
  DollarSign,
  Phone,
  Mail,
  ExternalLink,
  Building2,
  MapPinIcon,
  Search,
} from "lucide-react";

const EducationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [universitySearch, setUniversitySearch] = useState("");

  const isLearnerLoggedIn = () => (localStorage.getItem("learnerData") || localStorage.getItem("learner_current")) !== null;

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const category = urlParams.get("category");
    const hash = location.hash.substring(1);

    if (category && ["all", "tutorials", "universities"].includes(category)) {
      setSelectedCategory(category);
    } else if (hash === "universities") {
      setSelectedCategory("universities");
    }
  }, [location]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === "universities") {
      navigate("/universities", { replace: true });
    } else {
      const newUrl = categoryId === "all" ? "/education" : `/education?category=${categoryId}`;
      navigate(newUrl, { replace: true });
    }
  };

  const categories = [
    { id: "all", name: "All Services", icon: GraduationCap },
    { id: "tutorials", name: "Tutorials", icon: BookOpen },
    { id: "universities", name: "Universities", icon: Building2, redirect: true },
  ];

  const southAfricanUniversities = [
    { id: 1, name: "University of Cape Town (UCT)", location: "Cape Town, Western Cape", website: "https://www.uct.ac.za", applicationUrl: "https://applyonline.uct.ac.za/", type: "Public", established: 1829, ranking: "Top 200 globally", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science"], icon: Building2, lateApplication: true },
    { id: 2, name: "University of the Witwatersrand (Wits)", location: "Johannesburg, Gauteng", website: "https://www.wits.ac.za", applicationUrl: "https://www.wits.ac.za/applications/", type: "Public", established: 1896, ranking: "Top 300 globally", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science"], icon: Building2, lateApplication: true },
    { id: 3, name: "Stellenbosch University", location: "Stellenbosch, Western Cape", website: "https://www.sun.ac.za", applicationUrl: "https://student.sun.ac.za//signup", type: "Public", established: 1866, ranking: "Top 400 globally", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Theology"], icon: Building2, lateApplication: true },
    { id: 4, name: "University of Pretoria (UP)", location: "Pretoria, Gauteng", website: "https://www.up.ac.za", applicationUrl: "https://www.up.ac.za/online-application", type: "Public", established: 1908, ranking: "Top 500 globally", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Education"], icon: Building2, lateApplication: true },
    { id: 5, name: "University of Johannesburg (UJ)", location: "Johannesburg, Gauteng", website: "https://www.uj.ac.za", applicationUrl: "https://registration.uj.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP", type: "Public", established: 2005, ranking: "Top 600 globally", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Education"], icon: Building2, lateApplication: true },
    { id: 6, name: "University of KwaZulu-Natal (UKZN)", location: "Durban, KwaZulu-Natal", website: "https://www.ukzn.ac.za", applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply", type: "Public", established: 2004, ranking: "Top 700 globally", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Agriculture"], icon: Building2, lateApplication: true },
    { id: 7, name: "Rhodes University", location: "Grahamstown, Eastern Cape", website: "https://www.ru.ac.za", applicationUrl: "https://ross.ru.ac.za/", type: "Public", established: 1904, ranking: "Top 800 globally", programs: ["Arts", "Commerce", "Education", "Law", "Pharmacy", "Science"], icon: Building2, lateApplication: true },
    { id: 8, name: "University of the Free State (UFS)", location: "Bloemfontein, Free State", website: "https://www.ufs.ac.za", applicationUrl: "https://apply.ufs.ac.za/", type: "Public", established: 1904, ranking: "Top 900 globally", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Natural Sciences"], icon: Building2, lateApplication: true },
    { id: 9, name: "North-West University (NWU)", location: "Potchefstroom, North West", website: "https://www.nwu.ac.za", applicationUrl: "https://studies.nwu.ac.za/undergraduate-studies/application", type: "Public", established: 2004, ranking: "Top 1000 globally", programs: ["Arts", "Commerce", "Education", "Engineering", "Health Sciences", "Law", "Natural Sciences"], icon: Building2, lateApplication: true },
    { id: 10, name: "University of Limpopo", location: "Polokwane, Limpopo", website: "https://www.ul.ac.za", applicationUrl: "https://ulc-prod-webserver.ul.ac.za/pls/prodi41/gen.gw1pkg.gw1view", type: "Public", established: 2005, ranking: "Top 1500 globally", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2, lateApplication: true },
    { id: 11, name: "University of Venda", location: "Thohoyandou, Limpopo", website: "https://www.univen.ac.za", applicationUrl: "https://univenierp01.univen.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP", type: "Public", established: 1982, ranking: "Top 2000 globally", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2, lateApplication: true },
    { id: 12, name: "University of Fort Hare", location: "Alice, Eastern Cape", website: "https://www.ufh.ac.za", applicationUrl: "https://ienabler.ufh.ac.za/pls/prodi41/w99pkg.mi_login", type: "Public", established: 1916, ranking: "Top 2500 globally", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2, lateApplication: true },
    { id: 13, name: "University of the Western Cape (UWC)", location: "Cape Town, Western Cape", website: "https://www.uwc.ac.za", applicationUrl: "https://www.uwc.ac.za/admission-and-financial-aid/apply", type: "Public", established: 1959, ranking: "Top 1000 globally", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Natural Sciences"], icon: Building2, lateApplication: true },
    { id: 14, name: "University of Zululand", location: "KwaDlangezwa, KwaZulu-Natal", website: "https://www.unizulu.ac.za", applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply", type: "Public", established: 1960, ranking: "Top 3000 globally", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2, lateApplication: true },
    { id: 15, name: "Walter Sisulu University", location: "Mthatha, Eastern Cape", website: "https://www.wsu.ac.za", applicationUrl: "https://wsu.ac.za/index.php/en/undergraduate-programmes/new-students/admission-requirement", type: "Public", established: 2005, ranking: "Top 3500 globally", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2, lateApplication: true },
    { id: 16, name: "Cape Peninsula University of Technology (CPUT)", location: "Cape Town, Western Cape", website: "https://www.cput.ac.za", applicationUrl: "https://alecto.cput.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP", type: "Public", established: 2005, ranking: "Top 2000 globally", programs: ["Applied Sciences", "Business", "Education", "Engineering", "Health Sciences"], icon: Building2, lateApplication: true },
    { id: 17, name: "Central University of Technology (CUT)", location: "Bloemfontein, Free State", website: "https://www.cut.ac.za", applicationUrl: "https://www.cut.ac.za/apply", type: "Public", established: 1981, ranking: "Top 2500 globally", programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"], icon: Building2, lateApplication: true },
    { id: 18, name: "Durban University of Technology (DUT)", location: "Durban, KwaZulu-Natal", website: "https://www.dut.ac.za", applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply", type: "Public", established: 2002, ranking: "Top 3000 globally", programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"], icon: Building2, lateApplication: true },
    { id: 19, name: "Mangosuthu University of Technology (MUT)", location: "Durban, KwaZulu-Natal", website: "https://www.mut.ac.za", applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply", type: "Public", established: 1979, ranking: "Top 3500 globally", programs: ["Applied Sciences", "Business", "Engineering"], icon: Building2, lateApplication: true },
    { id: 20, name: "Tshwane University of Technology (TUT)", location: "Pretoria, Gauteng", website: "https://www.tut.ac.za", applicationUrl: "https://applications-prod.tut.ac.za/", type: "Public", established: 2004, ranking: "Top 2000 globally", programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"], icon: Building2, lateApplication: true },
    { id: 21, name: "Vaal University of Technology (VUT)", location: "Vanderbijlpark, Gauteng", website: "https://www.vut.ac.za", applicationUrl: "https://www.vut.ac.za/apply", type: "Public", established: 1966, ranking: "Top 2500 globally", programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"], icon: Building2, lateApplication: true },
    { id: 22, name: "University of South Africa (UNISA)", location: "Pretoria, Gauteng", website: "https://www.unisa.ac.za", applicationUrl: "https://www.unisa.ac.za/apply", type: "Public", established: 1873, ranking: "Top 1000 globally", programs: ["Arts", "Commerce", "Education", "Law", "Science"], icon: Building2, lateApplication: true },
    { id: 23, name: "Sol Plaatje University", location: "Kimberley, Northern Cape", website: "https://www.spu.ac.za", applicationUrl: "https://applications-prod.spu.ac.za/", type: "Public", established: 2014, ranking: "New University", programs: ["Arts", "Commerce", "Education", "Natural Sciences"], icon: Building2, lateApplication: true },
    { id: 24, name: "University of Mpumalanga", location: "Mbombela, Mpumalanga", website: "https://www.ump.ac.za", applicationUrl: "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications.aspx", type: "Public", established: 2014, ranking: "New University", programs: ["Agriculture", "Arts", "Commerce", "Education"], icon: Building2, lateApplication: true },
  ];

  const educationServices = [
    { id: 1, title: "Academic Tutoring", category: "tutorials", description: "One-on-one and group tutoring sessions for all subjects and grade levels", features: ["Math & Science", "Languages", "Test Preparation", "Homework Help"], duration: "1-2 hours per session", price: "R200-400/hour", rating: 4.8, reviews: 156, location: "In-person & Online", icon: BookOpen, popular: true },
    { id: 2, title: "University Application Assistance", category: "universities", description: "Complete guidance for university applications, essays, and documentation", features: ["Application Review", "Essay Writing", "Document Preparation", "Interview Prep", "Turnaround time: 1-4 days"], duration: "1-4 days", rating: 4.9, reviews: 89, location: "Online & In-person", icon: FileText, popular: true },
    { id: 6, title: "Scholarship Application Support", category: "universities", description: "Expert assistance with scholarship applications and financial aid", features: ["Scholarship Research", "Application Review", "Essay Writing", "Documentation"], duration: "1-3 weeks", price: "R1000-2500", rating: 4.9, reviews: 112, location: "Online", icon: FileText, popular: true },
  ];

  const filteredServices = selectedCategory === "all" ? educationServices : educationServices.filter((service) => service.category === selectedCategory);

  const renderUniversities = () => {
    const filteredUniversities = southAfricanUniversities.filter(
      (university) =>
        university.name.toLowerCase().includes(universitySearch.toLowerCase()) ||
        university.location.toLowerCase().includes(universitySearch.toLowerCase()) ||
        university.programs.some((program) => program.toLowerCase().includes(universitySearch.toLowerCase())),
    );

    return (
      <div className="relative bg-white">
        <div className="absolute inset-0"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              <a
                href="/education?category=universities"
                onClick={(e) => {
                  e.preventDefault();
                  handleCategoryChange("universities");
                  setTimeout(() => {
                    document.getElementById("universities")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="cursor-pointer transition-colors duration-300 hover:text-blue-600"
              >
                South African Universities
              </a>
            </h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-700">
              Explore all public universities in South Africa and apply directly through their official websites
            </p>
          </div>

          <div className="mx-auto mb-12 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search universities by name, location, or programs..."
                value={universitySearch}
                onChange={(e) => setUniversitySearch(e.target.value)}
                className="rounded-2xl border-0 bg-white/95 py-4 pl-12 pr-4 text-lg text-gray-900 shadow-lg transition-all duration-300 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((university) => {
                const IconComponent = university.icon;
                return (
                  <Card key={university.id} className={`group flex h-full flex-col border-0 shadow-xl transition-all duration-300 hover:shadow-2xl ${university.lateApplication ? "bg-green-100" : "bg-white/95 backdrop-blur-sm"}`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">{university.name}</CardTitle>
                            <div className="mt-1 flex items-center space-x-2">
                              <MapPinIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{university.location}</span>
                            </div>
                            {university.lateApplication && <Badge className="ml-1 animate-pulse bg-green-600 text-white">Late Application Open</Badge>}
                          </div>
                        </div>
                        <Badge className={university.type === "Public" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}>{university.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Established:</span>
                          <span className="font-medium text-gray-900">{university.established}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Global Ranking:</span>
                          <span className="font-medium text-gray-900">{university.ranking}</span>
                        </div>
                      </div>
                      <div className="mt-auto flex space-x-2 border-t border-gray-200 pt-4">
                        <Button variant="outlineLight" className="flex-1 border-blue-600 text-blue-600 hover:border-blue-700 hover:bg-blue-600 hover:text-white" onClick={() => window.open(university.website, "_blank")}>
                          <Globe className="mr-2 h-4 w-4" />
                          Website
                        </Button>
                        <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700" onClick={() => window.open(university.applicationUrl, "_blank")}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center">
                <div className="rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur-sm">
                  <Search className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">No universities found</h3>
                  <p className="mb-4 text-gray-600">No universities match your search for "{universitySearch}"</p>
                  <Button variant="outlineLight" onClick={() => setUniversitySearch("")} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                    Clear Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <SEO page="education" />
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h1 className="mb-6 text-5xl font-bold text-white md:text-6xl">Education Services</h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-300">
            Comprehensive educational support including university applications, tutorials, and academic guidance to help you achieve your goals.
          </p>
        </div>
      </div>

      {canAccess(AccessLevel.REGISTERED) && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Welcome back! 🎓</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">As a registered user, you have access to enhanced features and personalized learning experiences.</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="flex h-full flex-col border-2 border-green-200 bg-white/80 text-center">
                <div className="flex h-full flex-col p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Personalized Tutorials</h3>
                  <p className="mb-4 flex-1 text-gray-600">Access tutorials tailored to your grade level and learning preferences.</p>
                  <Button asChild className="mt-auto bg-green-600 text-white hover:bg-green-700">
                    <Link to="/tutorials/available">Browse Tutorials</Link>
                  </Button>
                </div>
              </Card>
              <Card className="flex h-full flex-col border-2 border-blue-200 bg-white/80 text-center">
                <div className="flex h-full flex-col p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Track Progress</h3>
                  <p className="mb-4 flex-1 text-gray-600">Monitor your learning journey and see your achievements.</p>
                  <Button asChild className="mt-auto bg-blue-600 text-white hover:bg-blue-700">
                    <Link to="/learner">View Dashboard</Link>
                  </Button>
                </div>
              </Card>
              <Card className="flex h-full flex-col border-2 border-purple-200 bg-white/80 text-center">
                <div className="flex h-full flex-col p-6">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Premium Features</h3>
                  <p className="mb-4 flex-1 text-gray-600">Unlock advanced features and get priority support.</p>
                  <Button asChild variant="outlineLight" className="mt-auto border-purple-600 text-purple-600 hover:bg-purple-50">
                    <Link to="/learner">Upgrade Now</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>
        <div className="relative z-10 px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">Our Education Services</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">Choose from our comprehensive range of educational services designed to support your academic journey</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button key={category.id} variant={selectedCategory === category.id ? "default" : "outlineLight"} onClick={() => handleCategoryChange(category.id)} className={`flex items-center space-x-2 rounded-xl px-6 py-3 transition-all duration-300 ${selectedCategory === category.id ? "bg-blue-600 text-white shadow-lg" : "hover:!border-blue-400 hover:!bg-blue-100 hover:!text-blue-700"}`}>
                    <IconComponent className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedCategory === "universities" ? (
        <div id="universities" className="space-y-16">
          {renderUniversities()}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
            <div className="relative z-10 mx-auto max-w-6xl px-6 py-20">
              <div className="mb-16 text-center">
                <h3 className="mb-6 text-4xl font-bold text-gray-900">Need Help with Applications?</h3>
                <p className="mx-auto max-w-3xl text-xl text-gray-600">Our expert team can guide you through the entire application process, from university applications to scholarship opportunities.</p>
              </div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {filteredServices.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <div key={service.id} className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white shadow-xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                      <div className="flex h-full flex-col p-8">
                        <div className="mb-6 flex items-start space-x-6">
                          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600">
                            <IconComponent className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="mb-2 text-2xl font-bold text-gray-900">{service.title}</h4>
                            <div className="mb-3 flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Star className="h-5 w-5 fill-current text-yellow-400" />
                                <span className="font-semibold text-gray-900">{service.rating}</span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="text-gray-600">{service.reviews} reviews</span>
                              {service.popular && <Badge className="ml-2 bg-green-100 text-green-800">Popular</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 flex-col">
                          <p className="mb-6 text-lg leading-relaxed text-gray-600">{service.description}</p>
                          <div className="mb-6">
                            <h5 className="mb-3 font-semibold text-gray-900">What's Included:</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {service.features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-gray-600">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mb-6 grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-4">
                            <div className="text-center">
                              <Clock className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                              <span className="text-sm text-gray-600">{service.duration}</span>
                            </div>
                            <div className="text-center">
                              <DollarSign className="mx-auto mb-1 h-5 w-5 text-green-500" />
                              <span className="text-sm font-semibold text-gray-900">{service.price ? service.price : "Contact for quote"}</span>
                            </div>
                            <div className="text-center">
                              <MapPin className="mx-auto mb-1 h-5 w-5 text-purple-500" />
                              <span className="text-sm text-gray-600">{service.location}</span>
                            </div>
                          </div>
                        </div>
                        <Button className="mt-auto w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:!bg-gradient-to-r hover:!from-blue-800 hover:!to-purple-800 hover:!text-white hover:shadow-xl" onClick={() => {
                          if (service.title === "Academic Tutoring") {
                            navigate("/tutorials");
                          } else {
                            navigate("/booking", { state: { service: service.title } });
                          }
                        }}>
                          <span>{service.title === "Academic Tutoring" ? "Choose Grade & Subject" : "Get Started"}</span>
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
          <div className="relative z-10 mx-auto max-w-6xl px-6 py-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card key={service.id} className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-none">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                          <IconComponent className="h-6 w-6 text-gray-800" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-gray-900">{service.title}</CardTitle>
                          <div className="mt-1 flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs text-gray-900">{service.rating}</span>
                            <span className="text-xs text-gray-700">({service.reviews} reviews)</span>
                            {service.popular && <Badge className="bg-gray-100 text-green-800">Popular</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <CardDescription className="mb-2 text-sm text-gray-800">{service.description}</CardDescription>
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-900">Features:</span>
                        <ul className="mt-1 list-inside list-disc text-xs text-gray-800">
                          {service.features.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-auto flex flex-wrap gap-4 border-t border-gray-100 pt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-700" />
                          <span className="text-xs text-gray-900">{service.duration}</span>
                        </div>
                        {service.price && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium text-gray-900">R {service.price.replace(/R|r/, "")}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-700" />
                          <span className="text-xs text-gray-900">{service.location}</span>
                        </div>
                      </div>
                      <Button className="mt-4 w-full rounded bg-gray-900 py-2 text-sm text-white hover:bg-gray-700" onClick={() => {
                        if (service.title === "Academic Tutoring") {
                          navigate("/tutorials");
                        } else if (service.title === "University Application Assistance") {
                          navigate("/universities");
                        } else {
                          navigate("/booking", { state: { service: service.title } });
                        }
                      }}>
                        <span>{service.title === "Academic Tutoring" ? "Choose Grade & Subject" : service.title === "University Application Assistance" ? "View Universities" : "Book This Service"}</span>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100"></div>
        <div className="relative z-10 px-6 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <h3 className="mb-6 text-4xl font-bold text-gray-900">Ready to Start Your Educational Journey?</h3>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Contact our education specialists to discuss your needs and find the perfect learning solution for you.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button className="rounded-xl bg-blue-600 px-8 py-3 text-white hover:bg-blue-700">
                <Phone className="mr-2 h-4 w-4" />
                Call Us
              </Button>
              <Button variant="outlineLight" className="rounded-xl px-8 py-3">
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </Button>
            </div>
          </div>
        </div>
      </div>
      {!isLearnerLoggedIn() && <Footer />}
    </Layout>
  );
};

export default EducationPage;
