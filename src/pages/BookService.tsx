import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send,
  ArrowRight,
  CheckCircle,
  Package,
  Car,
  Clock,
  MapPin,
  Heart,
  Calendar,
  Users,
  Shield,
  Home,
  PartyPopper,
  Baby,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";

// The 6 Send Me services: Running Errands + 5 others
const sendMeServices = [
  { name: "Running Errands", description: "Grocery shopping, prescriptions, dry cleaning, and daily errands", icon: Car },
  { name: "Delivery Services", description: "Package, document, and food delivery when you need it", icon: Package },
  { name: "Personal Assistance", description: "Appointment scheduling, file organization, and admin support", icon: Users },
  { name: "Household Tasks", description: "Light cleaning, tidying, pet feeding, and home tasks", icon: Home },
  { name: "Event Assistance", description: "Event setup, coordination, and day-of support", icon: PartyPopper },
  { name: "Childcare Support", description: "School pickup, drop-off, and supervised care when you’re busy", icon: Baby },
];

const BookService = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/booking?service=Send%20Me");
  };

  return (
    <Layout>
      <SEO page="bookService" />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-[#0a183d] via-[#183a7a] to-[#07122c] overflow-hidden py-24 flex items-center justify-center min-h-[480px]">
        <div className="absolute inset-0 opacity-30 pointer-events-none select-none">
          <svg width="100%" height="100%" viewBox="0 0 1440 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="1200" cy="100" r="180" fill="#fff" fillOpacity="0.07" />
            <circle cx="200" cy="400" r="120" fill="#fff" fillOpacity="0.04" />
            <circle cx="800" cy="300" r="100" fill="#fff" fillOpacity="0.06" />
          </svg>
        </div>
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6">
          <div className="w-full max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/10 mb-6">
              <Send className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">Send Me</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
              Personal errand running, delivery services, and on-demand assistance. We handle the tasks so you can focus on what matters—across Gauteng and South Africa.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white">Errands & Delivery</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white">Personal Assistance</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white">Gauteng & SA</span>
              </div>
            </div>
            <Button
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-3 rounded-xl shadow-lg text-lg transition-all duration-200"
              onClick={handleBookNow}
            >
              Book Send Me Service
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* What We Offer - 6 Send Me services */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
        <div className="relative z-10 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Send Me Services</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Running errands and more—six ways we can help. Pick a service and book when you’re ready.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sendMeServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.name}
                    className="flex flex-col p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-stretch gap-8">
            <div className="flex flex-col items-center flex-1 max-w-xs mx-auto">
              <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mb-2 font-bold text-lg">1</div>
              <span className="font-medium text-gray-800">Tell us what you need</span>
              <p className="text-gray-500 text-sm text-center mt-1">Choose a service type, date, time, and location. Add any special instructions.</p>
            </div>
            <div className="flex flex-col items-center flex-1 max-w-xs mx-auto">
              <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mb-2 font-bold text-lg">2</div>
              <span className="font-medium text-gray-800">We confirm & quote</span>
              <p className="text-gray-500 text-sm text-center mt-1">We’ll confirm your booking and provide a clear quote. Pay when you’re ready.</p>
            </div>
            <div className="flex flex-col items-center flex-1 max-w-xs mx-auto">
              <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center mb-2 font-bold text-lg">3</div>
              <span className="font-medium text-gray-800">We get it done</span>
              <p className="text-gray-500 text-sm text-center mt-1">Our team handles your task on the agreed date. We keep you updated.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-blue-50 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Why Choose Send Me?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <Clock className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-700 mb-2">Flexible & On-demand</h4>
              <p className="text-gray-600 text-sm">Book for same day, next day, or in advance. We work around your schedule.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <MapPin className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-700 mb-2">Gauteng & Beyond</h4>
              <p className="text-gray-600 text-sm">We operate across Gauteng and can arrange services in other regions.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <Shield className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-700 mb-2">Trusted & Reliable</h4>
              <p className="text-gray-600 text-sm">Professional, vetted helpers. Your time and tasks are in safe hands.</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <Users className="h-10 w-10 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-700 mb-2">Personal Touch</h4>
              <p className="text-gray-600 text-sm">Clear communication and updates so you’re always in the loop.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100" />
        <div className="relative z-10 py-20 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Ready to Send Me?</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Book your errand, delivery, or personal assistance task in a few clicks. We’ll take it from there.
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold"
              onClick={handleBookNow}
            >
              Book Send Me Service
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </Layout>
  );
};

export default BookService;
