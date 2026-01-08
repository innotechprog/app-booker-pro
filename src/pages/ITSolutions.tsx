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
  // DollarSign,
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
      price: "R5000",
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
      price: "R2000/month",
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
      price: "R8000",
      rating: 4.7,
      reviews: 52,
      location: "Remote & On-site",
      icon: Database,
      popular: false
    },
    {
      id: 4,
      title: "Mobile App Development",
      category: "development",
      description: "Native and cross-platform mobile application development for iOS and Android",
      features: ["iOS Development", "Android Development", "Cross-platform Apps", "App Store Deployment"],
      duration: "4-12 weeks",
      price: "R15000",
      rating: 4.8,
      reviews: 45,
      location: "Remote & On-site",
      icon: Smartphone,
      popular: false
    },
    {
      id: 5,
      title: "Cybersecurity",
      category: "security",
      description: "Comprehensive cybersecurity services to protect your business from threats and vulnerabilities",
      features: ["Vulnerability Assessment", "Penetration Testing", "Security Audits", "Incident Response"],
      duration: "2-6 weeks",
      price: "R7000",
      rating: 4.9,
      reviews: 61,
      location: "Remote & On-site",
      icon: Shield,
      popular: true
    },
    {
      id: 6,
      title: "Cloud Solutions",
      category: "cloud",
      description: "Cloud migration, setup, and management services for scalable business solutions",
      features: ["Cloud Migration", "AWS/Azure Setup", "Scalability Solutions", "Cost Optimization"],
      duration: "2-8 weeks",
      price: "R5000",
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

      {/* Hero Section - Modern & Tasty */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-blue-400 overflow-hidden py-24 flex items-center justify-center min-h-[480px]">
        {/* Decorative SVG background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none select-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="1200" cy="100" r="180" fill="#fff" fillOpacity="0.07" />
            <circle cx="200" cy="400" r="120" fill="#fff" fillOpacity="0.04" />
            <circle cx="800" cy="300" r="100" fill="#fff" fillOpacity="0.06" />
          </svg>
        </div>
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-10 flex flex-col items-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-yellow-300 via-blue-300 to-blue-600 bg-clip-text text-transparent">IT Solutions</span>
            </h1>
            <p className="text-lg md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
              Empowering your business with <span className="text-yellow-200 font-bold">modern web, mobile, cloud, and security</span> services for the digital age.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-white/30 backdrop-blur px-4 py-2 rounded-full shadow">
                <CheckCircle className="h-5 w-5 text-blue-700" />
                <span className="text-blue-900 font-semibold">Expert Developers</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/30 backdrop-blur px-4 py-2 rounded-full shadow">
                <CheckCircle className="h-5 w-5 text-blue-700" />
                <span className="text-blue-900 font-semibold">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/30 backdrop-blur px-4 py-2 rounded-full shadow">
                <CheckCircle className="h-5 w-5 text-blue-700" />
                <span className="text-blue-900 font-semibold">Modern Technologies</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/30 backdrop-blur px-4 py-2 rounded-full shadow">
                <CheckCircle className="h-5 w-5 text-blue-700" />
                <span className="text-blue-900 font-semibold">Cloud & Security</span>
              </div>
            </div>
            <Button
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-3 rounded-xl shadow-lg text-lg transition-all duration-200"
              onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
            >
              Explore Our Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Our Process Section */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Process</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mb-2 font-bold text-lg">1</div>
              <span className="font-medium text-gray-800">Consultation</span>
              <p className="text-gray-500 text-sm text-center">We discuss your needs and goals to understand your business challenges.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mb-2 font-bold text-lg">2</div>
              <span className="font-medium text-gray-800">Proposal</span>
              <p className="text-gray-500 text-sm text-center">You receive a tailored solution and transparent quote for your project.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mb-2 font-bold text-lg">3</div>
              <span className="font-medium text-gray-800">Implementation</span>
              <p className="text-gray-500 text-sm text-center">Our team delivers and deploys your IT solution with minimal disruption.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mb-2 font-bold text-lg">4</div>
              <span className="font-medium text-gray-800">Ongoing Support</span>
              <p className="text-gray-500 text-sm text-center">We provide continuous support and maintenance to keep you running smoothly.</p>
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
            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {filteredServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card key={service.id} className="rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-0 bg-white flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="h-7 w-7 text-blue-600" />
                        <CardTitle className="text-lg font-bold text-blue-900 flex-1">{service.title}</CardTitle>
                        {service.popular && <Badge className="bg-yellow-400 text-yellow-900 ml-2">Popular</Badge>}
                      </div>
                      <CardDescription className="text-gray-600 text-sm mb-2 min-h-[40px]">{service.description}</CardDescription>
                      <div className="flex items-center gap-1 text-yellow-400 text-xs">
                        {[...Array(Math.round(service.rating))].map((_, i) => (
                          <Star key={i} className="h-4 w-4 inline" />
                        ))}
                        <span className="ml-2 text-gray-500">({service.reviews} reviews)</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {service.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 items-center">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{service.duration}</span>
                        </div>
                        <div className="flex-1"></div>
                        <div className="flex items-center space-x-2 ml-auto">
                          <span className="text-lg font-bold text-blue-700">from R{service.price.replace(/R?/,'')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{service.location}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl shadow-md mt-4"
                        onClick={() => navigate("/booking", { state: { service: service.title } })}
                      >
                        <span>Get This Service</span>
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section (now directly after services grid) */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold text-blue-700 mb-2">Expert Team</h4>
              <p className="text-gray-600 text-sm">Certified professionals with years of experience in IT solutions and support.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold text-blue-700 mb-2">Customer Focused</h4>
              <p className="text-gray-600 text-sm">We tailor our services to your business needs and provide ongoing support.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold text-blue-700 mb-2">Innovative Solutions</h4>
              <p className="text-gray-600 text-sm">We use the latest technologies to deliver scalable and secure IT services.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-semibold text-blue-700 mb-2">Proven Results</h4>
              <p className="text-gray-600 text-sm">Trusted by leading brands and SMEs for reliable IT project delivery.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
        {/* Service Level Guarantees Section */}
        <div className="bg-blue-50 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Service Level Guarantees</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow p-6">
                <h4 className="font-semibold text-blue-700 mb-2">99.9% Uptime</h4>
                <p className="text-gray-600 text-sm">We guarantee high availability for all managed services.</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h4 className="font-semibold text-blue-700 mb-2">24/7 Support</h4>
                <p className="text-gray-600 text-sm">Our team is available around the clock to resolve your issues quickly.</p>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h4 className="font-semibold text-blue-700 mb-2">Fast Response</h4>
                <p className="text-gray-600 text-sm">We respond to all support requests within 1 hour during business days.</p>
              </div>
            </div>
          </div>
        </div>
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
              <Button
                variant="outline"
                className="border-gray-300 text-white bg-gray-900 hover:bg-gray-800 hover:text-white px-8 py-3 rounded-xl transition-colors duration-200"
              >
                <FileText className="mr-2 h-4 w-4" />
                Request Quote
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Clients Section */}
      <div className="relative bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Clients</h3>
          <div className="relative">
            <button
              type="button"
              aria-label="Scroll left"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-blue-600 border border-blue-700 rounded-full shadow p-2 hover:bg-blue-700 transition"
              onClick={() => {
                const el = document.getElementById('clients-carousel');
                if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div id="clients-carousel" className="overflow-x-auto scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                #clients-carousel::-webkit-scrollbar { display: none; }
              `}</style>
              <div className="flex gap-8 items-center min-w-[600px] md:min-w-[900px] lg:min-w-[1200px] px-2">
                {[
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", name: "React Corp"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", name: "Microsoft"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png", name: "JS Solutions"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", name: "Netflix"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", name: "Google"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg", name: "Facebook"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/SAP_2011_logo.svg", name: "SAP"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/IBM_logo.svg", name: "IBM"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Apple_logo_grey.svg", name: "Apple"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/6/6e/Amazon_Web_Services_Logo.svg", name: "AWS"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Adobe_Corporate_Logo.png", name: "Adobe"},
                  {logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/PayPal_2014_logo.svg", name: "PayPal"},
                ].map((client, idx) => (
                  <div key={idx} className="flex flex-col items-center bg-gray-50 rounded-xl shadow p-4 min-w-[140px] transition-transform hover:scale-105">
                    <img src={client.logo} alt={client.name} className="h-12 mb-2 object-contain" />
                    <span className="text-gray-700 text-sm font-medium text-center whitespace-nowrap">{client.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              aria-label="Scroll right"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-blue-600 border border-blue-700 rounded-full shadow p-2 hover:bg-blue-700 transition"
              onClick={() => {
                const el = document.getElementById('clients-carousel');
                if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl shadow p-6">
              <h4 className="font-semibold text-blue-700 mb-2">What types of IT services do you offer?</h4>
              <p className="text-gray-600 text-sm">We provide web development, system maintenance, cybersecurity, cloud solutions, and more. Contact us for a full list.</p>
            </div>
            <div className="bg-gray-50 rounded-xl shadow p-6">
              <h4 className="font-semibold text-blue-700 mb-2">How do I get a quote?</h4>
              <p className="text-gray-600 text-sm">Click the "Request Quote" button or contact us directly. We'll discuss your needs and send a tailored proposal.</p>
            </div>
            <div className="bg-gray-50 rounded-xl shadow p-6">
              <h4 className="font-semibold text-blue-700 mb-2">Do you provide ongoing support?</h4>
              <p className="text-gray-600 text-sm">Yes, we offer ongoing support and maintenance packages for all our IT solutions.</p>
            </div>
            <div className="bg-gray-50 rounded-xl shadow p-6">
              <h4 className="font-semibold text-blue-700 mb-2">What is your response time for support?</h4>
              <p className="text-gray-600 text-sm">We respond to all support requests within 1 hour during business days, and offer 24/7 emergency support.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default ITSolutions;
