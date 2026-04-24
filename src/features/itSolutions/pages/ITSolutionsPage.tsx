import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Monitor,
  Code,
  Database,
  Shield,
  Smartphone,
  Cloud,
  Settings,
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  MapPin,
  Users,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";

const ITSolutionsPage = () => {
  const navigate = useNavigate();
  const servicesSectionRef = React.useRef<HTMLDivElement | null>(null);

  const itServices = [
    {
      id: 1,
      title: "Web Development",
      category: "development",
      description: "Custom website and web application development using modern technologies and best practices",
      features: ["Responsive Design", "E-commerce Solutions", "CMS Development", "API Integration"],
      duration: "2 days to 2 months",
      price: "R1500",
      rating: 4.9,
      reviews: 127,
      location: "Remote & On-site",
      icon: Code,
      popular: true,
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
      popular: true,
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
      popular: false,
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
      popular: false,
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
      popular: true,
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
      popular: false,
    },
  ];

  const categories = [
    { id: "all", name: "All Services", icon: Monitor },
    { id: "development", name: "Development", icon: Code },
    { id: "support", name: "Support", icon: Settings },
    { id: "security", name: "Security", icon: Shield },
    { id: "cloud", name: "Cloud", icon: Cloud },
  ];

  const [selectedCategory, setSelectedCategory] = React.useState("all");

  const filteredServices = selectedCategory === "all" ? itServices : itServices.filter((service) => service.category === selectedCategory);
  const ctaButtonBaseClass = "rounded-xl px-8 py-3 text-base font-semibold shadow-lg transition-all duration-200";
  const categoryButtonBaseClass = "flex items-center space-x-2 rounded-xl px-6 py-3 transition-all duration-300";

  return (
    <Layout>
      <SEO page="it-solutions" />
      <div className="relative flex min-h-[480px] items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a183d] via-[#183a7a] to-[#07122c] py-24">
        <div className="pointer-events-none absolute inset-0 select-none opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 1440 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <circle cx="1200" cy="100" r="180" fill="#fff" fillOpacity="0.07" />
            <circle cx="200" cy="400" r="120" fill="#fff" fillOpacity="0.04" />
            <circle cx="800" cy="300" r="100" fill="#fff" fillOpacity="0.06" />
          </svg>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-3xl px-6 text-center">
          <h1 className="mb-6 text-6xl font-bold text-white md:text-7xl">IT Solutions</h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-white/90">
            Comprehensive IT services including web, mobile, cloud, and cybersecurity to empower your business for the digital age.
          </p>
          <div className="mb-8 flex flex-wrap justify-center gap-4">
            {["Expert Developers", "24/7 Support", "Modern Technologies", "Cloud & Security"].map((label) => (
              <div key={label} className="flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white">{label}</span>
              </div>
            ))}
          </div>
          <Button
            className={cn(buttonVariants({ variant: "default" }), ctaButtonBaseClass, "bg-yellow-400 text-blue-900 hover:bg-yellow-300")}
            onClick={() => servicesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            Explore Our Services
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Our Process</h2>
          <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
            {[
              ["1", "Consultation", "We discuss your needs and goals to understand your business challenges."],
              ["2", "Proposal", "You receive a tailored solution and transparent quote for your project."],
              ["3", "Implementation", "Our team delivers and deploys your IT solution with minimal disruption."],
              ["4", "Ongoing Support", "We provide continuous support and maintenance to keep you running smoothly."],
            ].map(([n, title, desc]) => (
              <div key={n} className="flex flex-col items-center">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">{n}</div>
                <span className="font-medium text-gray-800">{title}</span>
                <p className="text-center text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div ref={servicesSectionRef} className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>
        <div className="relative z-10 px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-900">Our IT Services</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">Choose from our comprehensive range of IT services designed to support your business needs</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      categoryButtonBaseClass,
                      selectedCategory === category.id
                        ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                        : "hover:!border-blue-400 hover:!bg-blue-100 hover:!text-blue-700",
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{category.name}</span>
                  </Button>
                );
              })}
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <Card key={service.id} className="flex flex-col rounded-xl border-0 bg-white shadow-lg transition-shadow duration-300 hover:shadow-2xl">
                    <CardHeader className="pb-2">
                      <div className="mb-2 flex items-center gap-2">
                        <IconComponent className="h-7 w-7 text-blue-600" />
                        <CardTitle className="flex-1 text-lg font-bold text-blue-900">{service.title}</CardTitle>
                        {service.popular && <Badge className="ml-2 bg-yellow-400 text-yellow-900">Popular</Badge>}
                      </div>
                      <CardDescription className="mb-2 min-h-[40px] text-sm text-gray-600">{service.description}</CardDescription>
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        {[...Array(Math.round(service.rating))].map((_, i) => (
                          <Star key={i} className="inline h-4 w-4" />
                        ))}
                        <span className="ml-2 text-gray-500">({service.reviews} reviews)</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col gap-4">
                      <div>
                        <h4 className="mb-2 font-medium text-gray-800">Features:</h4>
                        <ul className="list-inside list-disc text-sm text-gray-600">
                          {service.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{service.duration}</span>
                        </div>
                        <div className="ml-auto flex items-center space-x-2">
                          <span className="text-lg font-bold text-blue-700">from R{service.price.replace(/R?/, "")}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{service.location}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-blue-900">Why Choose Us?</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {[
              ["Expert Team", "Certified professionals with years of experience in IT solutions and support."],
              ["Customer Focused", "We tailor our services to your business needs and provide ongoing support."],
              ["Innovative Solutions", "We use the latest technologies to deliver scalable and secure IT services."],
              ["Proven Results", "Trusted by leading brands and SMEs for reliable IT project delivery."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl bg-white p-6 shadow">
                <h4 className="mb-2 font-semibold text-blue-700">{title}</h4>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-blue-900">Service Level Guarantees</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              ["99.9% Uptime", "We guarantee high availability for all managed services."],
              ["24/7 Support", "Our team is available around the clock to resolve your issues quickly."],
              ["Fast Response", "We respond to all support requests within 1 hour during business days."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl bg-white p-6 shadow">
                <h4 className="mb-2 font-semibold text-blue-700">{title}</h4>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100"></div>
        <div className="relative z-10 px-6 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <h3 className="mb-6 text-4xl font-bold text-gray-900">Ready to Transform Your Business?</h3>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Contact our IT specialists to discuss your needs and find the perfect technology solution for your business.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                className={cn(buttonVariants({ variant: "default" }), ctaButtonBaseClass, "bg-blue-600 text-white hover:bg-blue-700")}
                onClick={() => navigate("/contact")}
              >
                <Users className="mr-2 h-4 w-4" />
                Contact Us
              </Button>
              <Button
                variant="outline"
                className={cn(buttonVariants({ variant: "outline" }), ctaButtonBaseClass, "border-gray-300 bg-gray-900 text-white hover:bg-gray-800 hover:text-white")}
                onClick={() => navigate("/contact")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Request Quote
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              ["What types of IT services do you offer?", "We provide web development, system maintenance, cybersecurity, cloud solutions, and more. Contact us for a full list."],
              ["How do I get a quote?", "Click the \"Request Quote\" button or contact us directly. We will discuss your needs and send a tailored proposal."],
              ["Do you provide ongoing support?", "Yes, we offer ongoing support and maintenance packages for all our IT solutions."],
              ["What is your response time for support?", "We respond to all support requests within 1 hour during business days, and offer 24/7 emergency support."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-xl bg-gray-50 p-6 shadow">
                <h4 className="mb-2 font-semibold text-blue-700">{title}</h4>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default ITSolutionsPage;
