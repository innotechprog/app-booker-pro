import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
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
  Play,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  ArrowLeft,
  ExternalLink,
  Building2,
  MapPinIcon
} from "lucide-react";

const Education = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Services", icon: GraduationCap },
    { id: "tutorials", name: "Tutorials", icon: BookOpen },
    { id: "applications", name: "University Applications", icon: FileText },
    { id: "universities", name: "Universities", icon: Building2 },
    { id: "consulting", name: "Educational Consulting", icon: Users },
    { id: "online", name: "Online Learning", icon: Globe }
  ];

     const southAfricanUniversities = [
     {
       id: 1,
       name: "University of Cape Town (UCT)",
       location: "Cape Town, Western Cape",
       website: "https://www.uct.ac.za",
       applicationUrl: "https://applyonline.uct.ac.za/",
       type: "Public",
       established: 1829,
       ranking: "Top 200 globally",
       programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science"],
       icon: Building2
     },
     {
       id: 2,
       name: "University of the Witwatersrand (Wits)",
       location: "Johannesburg, Gauteng",
       website: "https://www.wits.ac.za",
       applicationUrl: "https://www.wits.ac.za/applications/",
       type: "Public",
       established: 1896,
       ranking: "Top 300 globally",
       programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science"],
       icon: Building2
     },
     {
       id: 3,
       name: "Stellenbosch University",
       location: "Stellenbosch, Western Cape",
       website: "https://www.sun.ac.za",
       applicationUrl: "https://www.sun.ac.za/english/maties/apply",
       type: "Public",
       established: 1866,
       ranking: "Top 400 globally",
       programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Theology"],
       icon: Building2
     },
     {
       id: 4,
       name: "University of Pretoria (UP)",
       location: "Pretoria, Gauteng",
       website: "https://www.up.ac.za",
       applicationUrl: "https://www.up.ac.za/online-application",
       type: "Public",
       established: 1908,
       ranking: "Top 500 globally",
       programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Education"],
       icon: Building2
     },
     {
       id: 5,
       name: "University of Johannesburg (UJ)",
       location: "Johannesburg, Gauteng",
       website: "https://www.uj.ac.za",
       applicationUrl: "https://www.uj.ac.za/apply",
       type: "Public",
       established: 2005,
       ranking: "Top 600 globally",
       programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Education"],
       icon: Building2
     },
     {
       id: 6,
       name: "University of KwaZulu-Natal (UKZN)",
       location: "Durban, KwaZulu-Natal",
       website: "https://www.ukzn.ac.za",
       applicationUrl: "https://www.ukzn.ac.za/apply/",
       type: "Public",
       established: 2004,
       ranking: "Top 700 globally",
       programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Agriculture"],
       icon: Building2
     },
     {
       id: 7,
       name: "Rhodes University",
       location: "Grahamstown, Eastern Cape",
       website: "https://www.ru.ac.za",
       applicationUrl: "https://ross.ru.ac.za/",
       type: "Public",
       established: 1904,
       ranking: "Top 800 globally",
       programs: ["Arts", "Commerce", "Education", "Law", "Pharmacy", "Science"],
       icon: Building2
     },
     {
       id: 8,
       name: "University of the Free State (UFS)",
       location: "Bloemfontein, Free State",
       website: "https://www.ufs.ac.za",
       applicationUrl: "https://apply.ufs.ac.za/",
       type: "Public",
       established: 1904,
       ranking: "Top 900 globally",
       programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Natural Sciences"],
       icon: Building2
     },
     {
       id: 9,
       name: "North-West University (NWU)",
       location: "Potchefstroom, North West",
       website: "https://www.nwu.ac.za",
       applicationUrl: "https://www.nwu.ac.za/applications",
       type: "Public",
       established: 2004,
       ranking: "Top 1000 globally",
       programs: ["Arts", "Commerce", "Education", "Engineering", "Health Sciences", "Law", "Natural Sciences"],
       icon: Building2
     },
     {
       id: 10,
       name: "University of Limpopo",
       location: "Polokwane, Limpopo",
       website: "https://www.ul.ac.za",
       applicationUrl: "https://www.ul.ac.za/index.php?Entity=Apply",
       type: "Public",
       established: 2005,
       ranking: "Top 1500 globally",
       programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
       icon: Building2
     },
     {
       id: 11,
       name: "University of Venda",
       location: "Thohoyandou, Limpopo",
       website: "https://www.univen.ac.za",
       applicationUrl: "https://www.univen.ac.za/apply",
       type: "Public",
       established: 1982,
       ranking: "Top 2000 globally",
       programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
       icon: Building2
     },
     {
       id: 12,
       name: "University of Fort Hare",
       location: "Alice, Eastern Cape",
       website: "https://www.ufh.ac.za",
       applicationUrl: "https://www.ufh.ac.za/apply/",
       type: "Public",
       established: 1916,
       ranking: "Top 2500 globally",
       programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
       icon: Building2
     },
     {
       id: 13,
       name: "University of the Western Cape (UWC)",
       location: "Cape Town, Western Cape",
       website: "https://www.uwc.ac.za",
       applicationUrl: "https://www.uwc.ac.za/study/undergraduate/apply",
       type: "Public",
       established: 1959,
       ranking: "Top 1000 globally",
       programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Natural Sciences"],
       icon: Building2
     },
     {
       id: 14,
       name: "University of Zululand",
       location: "KwaDlangezwa, KwaZulu-Natal",
       website: "https://www.unizulu.ac.za",
       applicationUrl: "https://www.unizulu.ac.za/apply",
       type: "Public",
       established: 1960,
       ranking: "Top 3000 globally",
       programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
       icon: Building2
     },
     {
       id: 15,
       name: "Walter Sisulu University",
       location: "Mthatha, Eastern Cape",
       website: "https://www.wsu.ac.za",
       applicationUrl: "https://apply.wsu.ac.za/",
       type: "Public",
       established: 2005,
       ranking: "Top 3500 globally",
       programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
       icon: Building2
     },
     {
       id: 16,
       name: "Cape Peninsula University of Technology (CPUT)",
       location: "Cape Town, Western Cape",
       website: "https://www.cput.ac.za",
       applicationUrl: "https://www.cput.ac.za/apply",
       type: "Public",
       established: 2005,
       ranking: "Top 2000 globally",
       programs: ["Applied Sciences", "Business", "Education", "Engineering", "Health Sciences"],
       icon: Building2
     },
     {
       id: 17,
       name: "Central University of Technology (CUT)",
       location: "Bloemfontein, Free State",
       website: "https://www.cut.ac.za",
       applicationUrl: "https://www.cut.ac.za/apply",
       type: "Public",
       established: 1981,
       ranking: "Top 2500 globally",
       programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"],
       icon: Building2
     },
     {
       id: 18,
       name: "Durban University of Technology (DUT)",
       location: "Durban, KwaZulu-Natal",
       website: "https://www.dut.ac.za",
       applicationUrl: "https://www.dut.ac.za/apply",
       type: "Public",
       established: 2002,
       ranking: "Top 3000 globally",
       programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"],
       icon: Building2
     },
     {
       id: 19,
       name: "Mangosuthu University of Technology (MUT)",
       location: "Durban, KwaZulu-Natal",
       website: "https://www.mut.ac.za",
       applicationUrl: "https://www.mut.ac.za/apply",
       type: "Public",
       established: 1979,
       ranking: "Top 3500 globally",
       programs: ["Applied Sciences", "Business", "Engineering"],
       icon: Building2
     },
     {
       id: 20,
       name: "Tshwane University of Technology (TUT)",
       location: "Pretoria, Gauteng",
       website: "https://www.tut.ac.za",
       applicationUrl: "https://www.tut.ac.za/apply",
       type: "Public",
       established: 2004,
       ranking: "Top 2000 globally",
       programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"],
       icon: Building2
     },
     {
       id: 21,
       name: "Vaal University of Technology (VUT)",
       location: "Vanderbijlpark, Gauteng",
       website: "https://www.vut.ac.za",
       applicationUrl: "https://www.vut.ac.za/apply",
       type: "Public",
       established: 1966,
       ranking: "Top 2500 globally",
       programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"],
       icon: Building2
     },
     {
       id: 22,
       name: "University of South Africa (UNISA)",
       location: "Pretoria, Gauteng",
       website: "https://www.unisa.ac.za",
       applicationUrl: "https://www.unisa.ac.za/apply",
       type: "Public",
       established: 1873,
       ranking: "Top 1000 globally",
       programs: ["Arts", "Commerce", "Education", "Law", "Science"],
       icon: Building2
     },
     {
       id: 23,
       name: "Sol Plaatje University",
       location: "Kimberley, Northern Cape",
       website: "https://www.spu.ac.za",
       applicationUrl: "https://www.spu.ac.za/apply",
       type: "Public",
       established: 2014,
       ranking: "New University",
       programs: ["Arts", "Commerce", "Education", "Natural Sciences"],
       icon: Building2
     },
     {
       id: 24,
       name: "University of Mpumalanga",
       location: "Mbombela, Mpumalanga",
       website: "https://www.ump.ac.za",
       applicationUrl: "https://www.ump.ac.za/apply",
       type: "Public",
       established: 2014,
       ranking: "New University",
       programs: ["Agriculture", "Arts", "Commerce", "Education"],
       icon: Building2
     }
   ];

  const educationServices = [
    {
      id: 1,
      title: "Academic Tutoring",
      category: "tutorials",
      description: "One-on-one and group tutoring sessions for all subjects and grade levels",
      features: ["Math & Science", "Languages", "Test Preparation", "Homework Help"],
      duration: "1-2 hours per session",
      price: "R200-400/hour",
      rating: 4.8,
      reviews: 156,
      location: "In-person & Online",
      icon: BookOpen,
      popular: true
    },
    {
      id: 2,
      title: "University Application Assistance",
      category: "applications",
      description: "Complete guidance for university applications, essays, and documentation",
      features: ["Application Review", "Essay Writing", "Document Preparation", "Interview Prep"],
      duration: "2-4 weeks",
      price: "R1500-3000",
      rating: 4.9,
      reviews: 89,
      location: "Online & In-person",
      icon: FileText,
      popular: true
    },
    {
      id: 3,
      title: "Study Skills Workshop",
      category: "tutorials",
      description: "Learn effective study techniques, time management, and exam strategies",
      features: ["Note-taking Methods", "Memory Techniques", "Time Management", "Stress Management"],
      duration: "4-6 hours",
      price: "R800-1200",
      rating: 4.7,
      reviews: 203,
      location: "Workshop Venues",
      icon: Users,
      popular: false
    },
    {
      id: 4,
      title: "Career Counseling",
      category: "consulting",
      description: "Professional guidance for career planning and educational pathways",
      features: ["Career Assessment", "Pathway Planning", "Skills Development", "Industry Insights"],
      duration: "1-2 hours per session",
      price: "R500-800/session",
      rating: 4.6,
      reviews: 67,
      location: "Online & In-person",
      icon: Users,
      popular: false
    },
    {
      id: 5,
      title: "Online Course Development",
      category: "online",
      description: "Custom online courses and learning materials for institutions and individuals",
      features: ["Course Design", "Content Creation", "Interactive Elements", "Assessment Tools"],
      duration: "2-8 weeks",
      price: "R5000-15000",
      rating: 4.8,
      reviews: 34,
      location: "Online",
      icon: Globe,
      popular: false
    },
    {
      id: 6,
      title: "Scholarship Application Support",
      category: "applications",
      description: "Expert assistance with scholarship applications and financial aid",
      features: ["Scholarship Research", "Application Review", "Essay Writing", "Documentation"],
      duration: "1-3 weeks",
      price: "R1000-2500",
      rating: 4.9,
      reviews: 112,
      location: "Online",
      icon: FileText,
      popular: true
    },
    {
      id: 7,
      title: "Language Learning Programs",
      category: "tutorials",
      description: "Comprehensive language courses for all proficiency levels",
      features: ["English", "Afrikaans", "Zulu", "French", "Spanish", "German"],
      duration: "8-12 weeks",
      price: "R1200-2000",
      rating: 4.7,
      reviews: 178,
      location: "Online & In-person",
      icon: BookOpen,
      popular: false
    },
    {
      id: 8,
      title: "Educational Technology Consulting",
      category: "consulting",
      description: "Guidance on implementing educational technology in institutions",
      features: ["Platform Selection", "Training Programs", "Integration Support", "Best Practices"],
      duration: "Ongoing",
      price: "R800-1500/hour",
      rating: 4.5,
      reviews: 23,
      location: "On-site & Online",
      icon: Globe,
      popular: false
    }
  ];

  const filteredServices = selectedCategory === "all" 
    ? educationServices 
    : educationServices.filter(service => service.category === selectedCategory);

  const renderUniversities = () => (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">South African Universities</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore all public universities in South Africa and apply directly through their official websites
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {southAfricanUniversities.map((university) => {
          const IconComponent = university.icon;
          return (
            <Card key={university.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                                             <CardTitle className="text-lg font-bold text-gray-100 group-hover:text-blue-300 transition-colors">
                         {university.name}
                       </CardTitle>
                       <div className="flex items-center space-x-2 mt-1">
                         <MapPinIcon className="h-4 w-4 text-gray-300" />
                         <span className="text-sm text-gray-300">{university.location}</span>
                       </div>
                    </div>
                  </div>
                  <Badge className={`${
                    university.type === "Public" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {university.type}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                                 <div className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-300">Established:</span>
                     <span className="font-medium text-gray-100">{university.established}</span>
                   </div>
                   <div className="flex justify-between text-sm">
                     <span className="text-gray-300">Global Ranking:</span>
                     <span className="font-medium text-gray-100">{university.ranking}</span>
                   </div>
                 </div>
                
                                 <div className="space-y-2">
                   <h4 className="font-semibold text-gray-100 text-sm">Programs:</h4>
                   <div className="flex flex-wrap gap-1">
                     {university.programs.slice(0, 4).map((program, index) => (
                       <Badge key={index} variant="outline" className="text-xs text-gray-200 border-gray-400">
                         {program}
                       </Badge>
                     ))}
                     {university.programs.length > 4 && (
                       <Badge variant="outline" className="text-xs text-gray-200 border-gray-400">
                         +{university.programs.length - 4} more
                       </Badge>
                     )}
                   </div>
                 </div>
                
                <div className="flex space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline"
                    className="flex-1 text-blue-600 border-blue-600 hover:bg-blue-50"
                    onClick={() => window.open(university.website, '_blank')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Website
                  </Button>
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    onClick={() => window.open(university.applicationUrl, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center mt-12">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Need Help with Applications?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our university application assistance service can help you navigate the application process, 
            write compelling essays, and prepare for interviews.
          </p>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl"
            onClick={() => setSelectedCategory("applications")}
          >
            Get Application Help
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <SEO page="education" />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-blue-600 p-2 sm:p-0"
              >
                <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 sm:flex-none">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Education Services</h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 truncate hidden sm:block">Empowering your educational journey</p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate("/booking")}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-xl text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Book Service</span>
              <span className="sm:hidden">Book</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Transform Your Educational Journey
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            From academic tutoring to university applications, we provide comprehensive educational support to help you achieve your goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5" />
              <span>Expert Tutors</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5" />
              <span>Proven Results</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5" />
              <span>Flexible Learning</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "hover:bg-blue-50 hover:border-blue-300"
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content based on selected category */}
      {selectedCategory === "universities" ? (
        renderUniversities()
      ) : (
        /* Services Grid */
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                                                   <CardTitle className="text-xl font-bold text-gray-100 group-hover:text-blue-300 transition-colors">
                           {service.title}
                         </CardTitle>
                         <div className="flex items-center space-x-2 mt-1">
                           <div className="flex items-center space-x-1">
                             <Star className="h-4 w-4 text-yellow-400 fill-current" />
                             <span className="text-sm font-medium text-gray-100">{service.rating}</span>
                           </div>
                           <span className="text-gray-400">•</span>
                           <span className="text-sm text-gray-300">{service.reviews} reviews</span>
                         </div>
                        </div>
                      </div>
                      {service.popular && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                                       <CardDescription className="text-gray-300 leading-relaxed">
                     {service.description}
                   </CardDescription>
                    
                                         <div className="space-y-3">
                       <h4 className="font-semibold text-gray-100">Features:</h4>
                       <div className="grid grid-cols-2 gap-2">
                         {service.features.map((feature, index) => (
                           <div key={index} className="flex items-center space-x-2">
                             <CheckCircle className="h-4 w-4 text-green-400" />
                             <span className="text-sm text-gray-300">{feature}</span>
                           </div>
                         ))}
                       </div>
                     </div>
                    
                                         <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-600">
                       <div className="flex items-center space-x-2">
                         <Clock className="h-4 w-4 text-gray-300" />
                         <span className="text-sm text-gray-300">{service.duration}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <DollarSign className="h-4 w-4 text-gray-300" />
                         <span className="text-sm font-medium text-gray-100">{service.price}</span>
                       </div>
                       <div className="flex items-center space-x-2">
                         <MapPin className="h-4 w-4 text-gray-300" />
                         <span className="text-sm text-gray-300">{service.location}</span>
                       </div>
                     </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl group-hover:shadow-lg transition-all duration-300"
                      onClick={() => navigate("/booking", { state: { service: service.title } })}
                    >
                      <span>Book This Service</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Start Your Educational Journey?</h3>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">
            Contact our education specialists to discuss your needs and find the perfect learning solution for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
              <Phone className="mr-2 h-4 w-4" />
              Call Us
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-xl">
              <Mail className="mr-2 h-4 w-4" />
              Email Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
