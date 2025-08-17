import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  Send, 
  Truck, 
  Plane, 
  Car, 
  Scissors, 
  Wrench, 
  Sun, 
  Paintbrush, 
  HardHat, 
  Home, 
  Monitor,
  GraduationCap,
  Users,
  FileText,
  Globe
} from "lucide-react";

const ServicesSection = () => {
  const navigate = useNavigate();

  const services = [
    { name: "Education", icon: GraduationCap, route: "/education" },
    { name: "Tutoring", icon: BookOpen, route: "/book-service" },
    { name: "Send Me", icon: Send, route: "/book-service" }, 
    { name: "Courier", icon: Truck, route: "/book-service" },
    { name: "Travel & Tour", icon: Plane, route: "/book-service" },
    { name: "Mobile Carwash", icon: Car, route: "/book-service" },
    { name: "Mobile Salon / Barber", icon: Scissors, route: "/book-service" },
    { name: "Plumbing", icon: Wrench, route: "/book-service" },
    { name: "Solar Installation", icon: Sun, route: "/book-service" },
    { name: "Painting", icon: Paintbrush, route: "/book-service" },
    { name: "Paving", icon: HardHat, route: "/book-service" },
    { name: "Ceiling", icon: Home, route: "/book-service" },
    { name: "IT Solutions", icon: Monitor, route: "/book-service" }
  ];

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced header with better styling */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive range of professional services designed to meet your needs with excellence and reliability
          </p>
        </div>
        
        {/* Services Grid with enhanced styling */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
              key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Button
                  variant="outline"
                  className="h-28 w-full bg-gradient-to-br from-gray-900 to-gray-800 hover:from-blue-900 hover:to-blue-800 text-white border-0 rounded-2xl font-medium text-sm transition-all duration-500 hover:scale-105 flex flex-col items-center justify-center space-y-3 p-4 shadow-lg hover:shadow-2xl group-hover:shadow-blue-500/25 cursor-pointer"
                  onClick={() => navigate(service.route)}
                >
                  <div className="relative">
                    <IconComponent className="h-8 w-8 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                    <div className="absolute -inset-2 bg-blue-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-center leading-tight font-semibold">{service.name}</span>
                </Button>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-blue-600/5 rounded-2xl transition-all duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>
        
        {/* Call to action section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Choose from our wide range of services and let us help you achieve your goals with professional excellence.
            </p>
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate("/book-service")}
            >
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
      
      {/* Enhanced Scroll to Top Button */}
      <Button
        size="sm"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl z-50 transition-all duration-300 hover:scale-110"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
    </section>
  );
};

export default ServicesSection;