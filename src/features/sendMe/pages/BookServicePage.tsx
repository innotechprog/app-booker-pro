import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Clock, MapPin, Send, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { beyondExamples, sendMeServices } from "@/features/sendMe/constants/services";

const BookServicePage = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate("/booking?service=Send%20Me");
  };

  return (
    <Layout>
      <SEO page="bookService" />

      <section className="relative overflow-hidden bg-gradient-to-b from-[#081736] via-[#14356f] to-[#07122c]">
        <div className="absolute inset-0 pointer-events-none select-none opacity-30">
          <svg width="100%" height="100%" viewBox="0 0 1440 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
            <circle cx="1200" cy="100" r="180" fill="#fff" fillOpacity="0.07" />
            <circle cx="200" cy="400" r="120" fill="#fff" fillOpacity="0.04" />
            <circle cx="800" cy="300" r="100" fill="#fff" fillOpacity="0.06" />
          </svg>
        </div>
        <div className="relative z-10 mx-auto flex min-h-[520px] w-full max-w-6xl items-center px-6 py-20">
          <div className="w-full text-center">
            <div className="mx-auto mb-6 inline-flex items-center justify-center rounded-full bg-white/10 p-3 ring-1 ring-white/20">
              <Send className="h-10 w-10 text-white" />
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100/90">On-Demand Personal Assistance</p>
            <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">Send Me</h1>
            <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-white/90 md:text-xl">
              Personal errand running, delivery services, and on-demand assistance. We handle the tasks so you can focus on what matters-across Gauteng and South Africa.
            </p>
            <div className="mb-10 flex flex-wrap justify-center gap-3">
              <div className="flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white">Errands & Delivery</span>
              </div>
              <div className="flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white">Personal Assistance</span>
              </div>
              <div className="flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white">Gauteng & SA</span>
              </div>
            </div>
            <Button
              className="h-12 rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
              onClick={handleBookNow}
            >
              Book Send Me Service
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
        <div className="relative z-10 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Core Services</p>
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Our Send Me Services</h2>
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
                We go beyond basic errands. Need us to source car parts, buy items on your behalf, collect documents, or handle custom requests? Tell us what you need and we will handle it end-to-end.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sendMeServices.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.name}
                    className="group flex min-h-[180px] flex-col rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2 transition-colors group-hover:bg-blue-100">
                        <IconComponent className="h-6 w-6 text-blue-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Custom Requests</p>
            <h3 className="mt-1 text-2xl font-bold text-blue-900">Need something not listed? We can still help.</h3>
            <p className="mt-2 max-w-3xl text-gray-700">
              Send Me is flexible by design. If your request is not in the service cards above, share the details and we will arrange it for you.
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
              {beyondExamples.map((item) => (
                <li key={item} className="flex items-start gap-2 rounded-lg bg-white px-3 py-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button
                type="button"
                onClick={handleBookNow}
                className="h-10 rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700"
              >
                Request a Custom Task
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">How It Works</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col items-center rounded-2xl border border-gray-100 bg-gray-50/60 p-5 text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">1</div>
              <span className="font-medium text-gray-800">Tell us what you need</span>
              <p className="mt-1 text-sm text-gray-500">Choose a service type, date, time, and location. Add any special instructions.</p>
            </div>
            <div className="mx-auto flex max-w-xs flex-col items-center rounded-2xl border border-gray-100 bg-gray-50/60 p-5 text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">2</div>
              <span className="font-medium text-gray-800">We confirm & quote</span>
              <p className="mt-1 text-sm text-gray-500">We will confirm your booking and provide a clear quote. Pay when you are ready.</p>
            </div>
            <div className="mx-auto flex max-w-xs flex-col items-center rounded-2xl border border-gray-100 bg-gray-50/60 p-5 text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">3</div>
              <span className="font-medium text-gray-800">We get it done</span>
              <p className="mt-1 text-sm text-gray-500">Our team handles your task on the agreed date. We keep you updated.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="mb-6 text-3xl font-bold text-blue-900">Why Choose Send Me?</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
              <Clock className="mx-auto mb-2 h-10 w-10 text-blue-600" />
              <h4 className="mb-2 font-semibold text-blue-700">Flexible & On-demand</h4>
              <p className="text-sm text-gray-600">Book for same day, next day, or in advance. We work around your schedule.</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
              <MapPin className="mx-auto mb-2 h-10 w-10 text-blue-600" />
              <h4 className="mb-2 font-semibold text-blue-700">Gauteng & Beyond</h4>
              <p className="text-sm text-gray-600">We operate across Gauteng and can arrange services in other regions.</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
              <Shield className="mx-auto mb-2 h-10 w-10 text-blue-600" />
              <h4 className="mb-2 font-semibold text-blue-700">Trusted & Reliable</h4>
              <p className="text-sm text-gray-600">Professional, vetted helpers. Your time and tasks are in safe hands.</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
              <Users className="mx-auto mb-2 h-10 w-10 text-blue-600" />
              <h4 className="mb-2 font-semibold text-blue-700">Personal Touch</h4>
              <p className="text-sm text-gray-600">Clear communication and updates so you are always in the loop.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100" />
        <div className="relative z-10 px-6 py-20">
          <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white/90 p-10 text-center shadow-sm">
            <h3 className="mb-4 text-4xl font-bold text-gray-900">Ready to Send Me?</h3>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
              Book your errand, delivery, or personal assistance task in a few clicks. We will take it from there.
            </p>
            <Button
              className="h-12 rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white hover:bg-blue-700"
              onClick={handleBookNow}
            >
              Book Send Me Service
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="mt-4 text-sm text-gray-500">Prefer WhatsApp or call-back? Submit the booking form and choose your preferred contact method.</p>
          </div>
        </div>
      </section>

      <Footer />
    </Layout>
  );
};

export default BookServicePage;
