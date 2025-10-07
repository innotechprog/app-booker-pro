import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Code, 
  Database, 
  Shield, 
  Smartphone, 
  Cloud, 
  Network, 
  Settings,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  DollarSign,
  MapPin,
  Users,
  FileText,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";

const ITSolutions = () => {
  const navigate = useNavigate();

  const itServices = [
    {
      id: 1,
      title: "Web Development",
      category: "development",
      description: "Custom website and web application development using modern technologies and best practices",
      features: ["Responsive Design", "E-commerce Solutions", "CMS Development", "API Integration"],
      duration: "2-8 weeks",
      price: "R5000-50000",
      rating: 4.9,
      reviews: 127,
      location: "Remote & On-site",
      icon: Code,
      popular: true
    },
    {
      id: 2,
      title: "System Maintenance",
      category: "support",
      description: "Comprehensive IT system maintenance, updates, and optimization for peak performance",
      features: ["Regular Updates", "Security Patches", "Performance Optimization", "Backup Solutions"],
      duration: "Ongoing",
      price: "R2000-8000/month",
      rating: 4.8,
      reviews: 89,
      location: "Remote & On-site",
      icon: Settings,
      popular: true
    },
    {
      id: 3,
      title: "Database Management",
      category: "database",
      description: "Professional database design, implementation, and management services",
      features: ["Database Design", "Data Migration", "Performance Tuning", "Security Implementation"],
      duration: "1-4 weeks",
      price: "R3000-25000",
      rating: 4.7,
      reviews: 56,
      location: "Remote & On-site",
      icon: Database,
      popular: false
    },
    {
      id: 4,
      title: "Cybersecurity",
      category: "security",
      description: "Comprehensive cybersecurity solutions to protect your business from digital threats",
      features: ["Security Audits", "Firewall Setup", "Vulnerability Assessment", "Incident Response"],
      duration: "1-6 weeks",
      price: "R4000-30000",
      rating: 4.9,
      reviews: 78,
      location: "Remote & On-site",
      icon: Shield,
      popular: true
    },
    {
      id: 5,
      title: "Mobile App Development",
      category: "development",
      description: "Native and cross-platform mobile application development for iOS and Android",
      features: ["iOS Development", "Android Development", "Cross-platform Apps", "App Store Deployment"],
      duration: "4-12 weeks",
      price: "R15000-80000",
      rating: 4.8,
      reviews: 45,
      location: "Remote & On-site",
      icon: Smartphone,
      popular: false
    },
    {
      id: 6,
      title: "Cloud Solutions",
      category: "cloud",
      description: "Cloud migration, setup, and management services for scalable business solutions",
      features: ["Cloud Migration", "AWS/Azure Setup", "Scalability Solutions", "Cost Optimization"],
      duration: "2-8 weeks",
      price: "R5000-40000",
      rating: 4.6,
      reviews: 34,
      location: "Remote & On-site",
      icon: Cloud,
      popular: false
    }
  ];

  const categories = [
    { id: "all", name: "All Services", icon: Monitor },
    { id: "development", name: "Development", icon: Code },
    { id: "support", name: "Support", icon: Settings },
    { id: "security", name: "Security", icon: Shield },
    { id: "cloud", name: "Cloud", icon: Cloud }
  ];

  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const filteredServices = selectedCategory === "all" 
    ? itServices 
    : itServices.filter(service => service.category === selectedCategory);

  return (
    <Layout>
      <SEO page="it-solutions" />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden py-20">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            IT Solutions
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Professional IT services including web development, system maintenance, cybersecurity, and cloud solutions to help your business thrive in the digital age.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-white" />
              <span className="text-white">Expert Developers</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-white" />
              <span className="text-white">24/7 Support</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 text-white" />
              <span className="text-white">Modern Technologies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>
        <div className="relative z-10 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our IT Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose from our comprehensive range of IT services designed to support your business needs
              </p>
            </div>
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
                        : "hover:!bg-blue-100 hover:!border-blue-400 hover:!text-blue-700"
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
      </div>

      {/* Services Grid */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
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
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {service.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium text-gray-900">{service.rating}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600">{service.reviews} reviews</span>
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
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {service.description}
                    </CardDescription>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">Features:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{service.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{service.price}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{service.location}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:!bg-gradient-to-r hover:!from-blue-800 hover:!to-purple-800 text-white hover:!text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => navigate("/booking", { state: { service: service.title } })}
                    >
                      <span>Get This Service</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100"></div>
        <div className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Business?</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Contact our IT specialists to discuss your needs and find the perfect technology solution for your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl">
                <Users className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl">
                <FileText className="mr-2 h-4 w-4" />
                Request Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </Layout>
  );
};

export default ITSolutions;
