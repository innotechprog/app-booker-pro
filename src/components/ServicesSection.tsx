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
    { 
      name: "Education", 
      icon: GraduationCap, 
      route: "/education",
      description: "Comprehensive educational support including tutoring, university applications, and career guidance"
    },
    { 
      name: "Send Me", 
      icon: Send, 
      route: "/book-service",
      description: "Personal errand running, delivery services, and on-demand assistance for your daily needs"
    },
    { 
      name: "IT Solutions", 
      icon: Monitor, 
      route: "/book-service",
      description: "Professional IT services including web development, system maintenance, and technical support"
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className="h-full bg-gradient-to-br from-gray-900 to-gray-800 hover:from-blue-900 hover:to-blue-800 text-white border-0 rounded-2xl font-medium text-sm transition-all duration-500 hover:scale-105 flex flex-col items-center justify-center space-y-4 p-6 shadow-lg hover:shadow-2xl group-hover:shadow-blue-500/25 cursor-pointer"
                  onClick={() => navigate(service.route)}
                >
                  <div className="relative">
                    <IconComponent className="h-12 w-12 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
                    <div className="absolute -inset-3 bg-blue-400/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold leading-tight">{service.name}</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{service.description}</p>
                  </div>
                </div>
                
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
      

    </section>
  );
};

export default ServicesSection;