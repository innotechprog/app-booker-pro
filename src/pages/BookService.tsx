import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, Shield, Zap, Calendar, MapPin, Home, LogIn, UserPlus, BookOpen } from "lucide-react";
import SEO from "@/components/SEO";

const BookService = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 pb-20 md:pb-0">
      <SEO page="bookService" />
      
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              IBIS<span className="text-blue-400">.</span>
            </h1>
            <div className="flex items-center space-x-2 sm:space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
                className="text-white hover:text-blue-300 hover:bg-white/10 px-2 sm:px-4 py-2 rounded-2xl transition-all duration-300 text-sm sm:text-base"
              >
                <Home className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden">Home</span>
              </Button>
              <Button
                onClick={() => navigate("/login")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 py-2 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <LogIn className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Login</span>
        </Button>
            </div>
          </div>
                  </div>
                </div>

      {/* Send Me Hero Section */}
      <div className="px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
              <Send className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              Send Me Service
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Your trusted helping hand for all your errands and tasks. Let us take care of your to-do list while you focus on what matters most.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <div className="flex items-center space-x-2 bg-blue-600/20 px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                <span className="text-blue-200">Reliable & Trusted</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-600/20 px-4 py-2 rounded-full">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-green-200">Secure & Safe</span>
              </div>
              <div className="flex items-center space-x-2 bg-yellow-600/20 px-4 py-2 rounded-full">
                <Zap className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-200">Fast & Efficient</span>
                  </div>
                </div>
              </div>

          {/* Service Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Flexible Scheduling</h3>
              <p className="text-gray-300">
                Book services at your convenience with flexible scheduling options to fit your busy lifestyle.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Wide Coverage</h3>
              <p className="text-gray-300">
                We serve multiple locations with reliable agents ready to help you with various tasks and errands.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Verified Agents</h3>
              <p className="text-gray-300">
                All our agents are thoroughly vetted and trained to provide you with the best service experience.
              </p>
            </div>
          </div>

          {/* Service Categories */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Our Send Me Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Row 1 */}
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-white text-lg mb-4">Errand Running</h4>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li>• Grocery shopping</li>
                  <li>• Picking up prescriptions</li>
                  <li>• Dropping off or collecting dry cleaning</li>
                </ul>
                <a href="#booking" className="text-blue-300 hover:text-blue-200 font-medium">Read more →</a>
              </div>
              
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-white text-lg mb-4">Delivery Services</h4>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li>• Delivering packages, gifts, or important documents</li>
                  <li>• Meal or food delivery</li>
                  <li>• Transporting items locally</li>
                </ul>
                <a href="#booking" className="text-blue-300 hover:text-blue-200 font-medium">Read more →</a>
              </div>
              
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-white text-lg mb-4">Personal Assistance</h4>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li>• Scheduling appointments</li>
                  <li>• Organizing files or paperwork</li>
                  <li>• Booking travel or accommodations</li>
                </ul>
                <a href="#booking" className="text-blue-300 hover:text-blue-200 font-medium">Read more →</a>
              </div>
              
              {/* Row 2 */}
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-white text-lg mb-4">Household Tasks</h4>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li>• Light cleaning or tidying</li>
                  <li>• Plant watering or pet feeding when you're away</li>
                  <li>• Handling home maintenance appointments</li>
                </ul>
                <a href="#booking" className="text-blue-300 hover:text-blue-200 font-medium">Read more →</a>
              </div>
              
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-white text-lg mb-4">Business Support</h4>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li>• Document filing or copying</li>
                  <li>• Running office-related errands</li>
                  <li>• Event setup and coordination</li>
                </ul>
                <a href="#booking" className="text-blue-300 hover:text-blue-200 font-medium">Read more →</a>
              </div>
              
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-white text-lg mb-4">Event Assistance</h4>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li>• Picking up supplies or decorations</li>
                  <li>• Helping with setup or teardown</li>
                  <li>• Assisting during the event</li>
                </ul>
                <a href="#booking" className="text-blue-300 hover:text-blue-200 font-medium">Read more →</a>
              </div>
              
              {/* Row 3 */}
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-white text-lg mb-4">Childcare/Family Support</h4>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li>• Picking up or dropping off kids at school or activities</li>
                  <li>• Babysitting or supervising children temporarily</li>
                </ul>
                <a href="#booking" className="text-blue-300 hover:text-blue-200 font-medium">Read more →</a>
              </div>
              
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-white text-lg mb-4">Specialized Tasks</h4>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li>• Helping with technology setup</li>
                  <li>• Assisting elderly or disabled individuals</li>
                </ul>
                <a href="#booking" className="text-blue-300 hover:text-blue-200 font-medium">Read more →</a>
              </div>
              
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-white text-lg mb-4">Emergency Help</h4>
                <ul className="space-y-2 text-gray-300 mb-4">
                  <li>• Last-minute delivery of essentials</li>
                  <li>• Quick support for unexpected needs</li>
                </ul>
                <a href="#booking" className="text-blue-300 hover:text-blue-200 font-medium">Read more →</a>
              </div>
                </div>
              </div>

          {/* Areas of Operation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-4">Our Areas of Operation</h2>
            <p className="text-gray-300 text-center mb-8 text-lg">
              We proudly serve multiple locations across Gauteng, South Africa.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Johannesburg */}
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-blue-300 text-lg mb-4">Johannesburg</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>Soweto</li>
                  <li>Sandton</li>
                  <li>Midrand</li>
                  <li>Randburg</li>
                  <li>Roodepoort</li>
                </ul>
              </div>
              
              {/* Pretoria */}
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-blue-300 text-lg mb-4">Pretoria</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>Centurion</li>
                  <li>Hatfield</li>
                  <li>Menlyn</li>
                  <li>Wonderboom</li>
                  <li>Brooklyn</li>
                </ul>
              </div>
              
              {/* Ekurhuleni */}
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-blue-300 text-lg mb-4">Ekurhuleni</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>Benoni</li>
                  <li>Boksburg</li>
                  <li>Kempton Park</li>
                  <li>Germiston</li>
                  <li>Alberton</li>
                </ul>
              </div>

              {/* West Rand */}
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-blue-300 text-lg mb-4">West Rand</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>Krugersdorp</li>
                  <li>Randfontein</li>
                  <li>Westonaria</li>
                  <li>Muldersdrift</li>
                  <li>Carletonville</li>
                </ul>
              </div>

              {/* Tshwane */}
              <div className="bg-white/20 rounded-xl p-6 border border-white/20">
                <h4 className="font-bold text-blue-300 text-lg mb-4">Tshwane</h4>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>Mabopane</li>
                  <li>Soshanguve</li>
                  <li>Akasia</li>
                  <li>Ga-Rankuwa</li>
                  <li>Atteridgeville</li>
                </ul>
              </div>
            </div>
              </div>

          {/* Book Now Button */}
          <div className="text-center mb-16 hidden md:block">
              <Button
              onClick={() => navigate('/booking')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-4 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
              Book Now
              </Button>
          </div>
        </div>
              </div>

      {/* Fixed Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50">
        <div className="flex items-center justify-center py-4 px-6">
              <Button
            onClick={() => navigate("/booking")}
            className="max-w-xs bg-purple-600 hover:bg-purple-700 text-white py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-base"
              >
            Book Now
              </Button>
        </div>
      </div>
    </div>
  );
};

export default BookService;