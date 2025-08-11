import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-6 shadow-lg">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
            Contact Us
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get in touch with us for any inquiries or to request our services. We're here to help you succeed.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information with enhanced styling */}
          <div className="space-y-10">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Ready to get started? Contact us today and let us know how we can help you with your needs. Our team is ready to assist you with any questions or service requests.
              </p>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Phone</h4>
                  <a 
                    href="tel:+15551234567" 
                    className="text-gray-600 text-lg hover:text-blue-600 transition-colors block"
                  >
                    +1 (555) 123-4567
                  </a>
                  <a 
                    href="tel:+15559876543" 
                    className="text-gray-600 text-lg hover:text-blue-600 transition-colors block"
                  >
                    +1 (555) 987-6543
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Email</h4>
                  <a 
                    href="mailto:info@ibinnovative.com" 
                    className="text-gray-600 text-lg hover:text-blue-600 transition-colors block"
                  >
                    info@ibinnovative.com
                  </a>
                  <a 
                    href="mailto:support@ibinnovative.com" 
                    className="text-gray-600 text-lg hover:text-blue-600 transition-colors block"
                  >
                    support@ibinnovative.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Address</h4>
                  <a 
                    href="https://maps.google.com/?q=123+Innovation+Street+Tech+City+TC+12345" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 text-lg hover:text-blue-600 transition-colors block"
                  >
                    123 Innovation Street<br />
                    Tech City, TC 12345
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-6 group">
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Business Hours</h4>
                  <div className="space-y-1 text-gray-600 text-lg">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Contact Form */}
          <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-gray-700 font-semibold">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-gray-700 font-semibold">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john@example.com" 
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone</Label>
                <Input 
                  id="phone" 
                  placeholder="+1 (555) 123-4567" 
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="service" className="text-gray-700 font-semibold">Service Interested In</Label>
                <select 
                  id="service" 
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white text-gray-900"
                >
                  <option value="">Select a service</option>
                  <option value="tutoring">Tutoring</option>
                  <option value="send-me">Send Me</option>
                  <option value="courier">Courier</option>
                  <option value="travel-tour">Travel & Tour</option>
                  <option value="mobile-carwash">Mobile Carwash</option>
                  <option value="mobile-salon">Mobile Salon / Barber</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="solar-installation">Solar Installation</option>
                  <option value="painting">Painting</option>
                  <option value="paving">Paving</option>
                  <option value="ceiling">Ceiling</option>
                  <option value="it-solutions">IT Solutions</option>
                </select>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="message" className="text-gray-700 font-semibold">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your project or inquiry..."
                  rows={4}
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-xl transition-all duration-300 resize-none"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Send className="mr-3 h-5 w-5" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
