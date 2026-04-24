import { Button } from "@/components/ui/button";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ArrowUp
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              IBIS<span className="text-blue-400">.</span>
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Your trusted partner for innovative solutions. We provide comprehensive services to help you achieve your goals with excellence and reliability.
            </p>
            <div className="flex space-x-4">
              {/* Social media links removed as requested */}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#services" className="text-gray-300 hover:text-white transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <a href="/education" className="text-gray-300 hover:text-white transition-colors">
                  Tutoring
                </a>
              </li>
              <li>
                <a href="/send-me" className="text-gray-300 hover:text-white transition-colors">
                  Send Me
                </a>
              </li>
              <li>
                <a href="/it-solutions" className="text-gray-300 hover:text-white transition-colors">
                  IT Solutions
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400" />
                <a 
                  href="tel:0684240852" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  068 424 0852
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400" />
                <a 
                  href="mailto:info@ib-innovativesolutions.com" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  info@ib-innovativesolutions.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 mt-1" />
                <span className="text-gray-300">Available online only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} IB Innovative Solutions. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <Button
        size="sm"
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl z-50 transition-all duration-300 hover:scale-110"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </footer>
  );
};

export default Footer;
