import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  });
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const isValidCellphone = (cell) => {
    return /^\d{10,15}$/.test(cell.replace(/\s+/g, ""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    if (!form.firstName || !form.lastName || !form.email || !form.message || !form.phone) {
      setStatus("Please fill in all required fields.");
      return;
    }
    if (!isValidCellphone(form.phone)) {
      setStatus("Cellphone must contain only numbers (10-15 digits).");
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch("http://localhost:5000/api/contact/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          service: form.service,
          message: form.message
        })
      });
      if (res.ok) {
        setStatus("Message sent successfully!");
        setForm({ firstName: "", lastName: "", email: "", phone: "", service: "", message: "" });
      } else {
        const data = await res.json();
        setStatus(data.error || "Failed to send message. Please try again.");
      }
    } catch {
      setStatus("Failed to send message. Please try again.");
    }
    setIsSending(false);
  };

  return (
    <section className="py-20 px-6 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header removed as requested */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Get In Touch</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Ready to get started? Contact us today and let us know how we can help you with your needs. Our team is ready to assist you with any questions or service requests.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Phone / WhatsApp</h4>
                  <div className="space-y-1">
                    <a href="tel:0684240852" className="block text-gray-600 hover:text-blue-600 transition-colors">
                      068 424 0852
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Email</h4>
                  <div className="space-y-1">
                    <a href="mailto:info@ib-innovativesolutions.com" className="block text-gray-600 hover:text-green-600 transition-colors">
                      info@ib-innovativesolutions.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Location</h4>
                  <span className="block text-gray-600">Available online only</span>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Business Hours</h4>
                  <div className="space-y-1 text-gray-600">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-700 font-semibold">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    value={form.firstName}
                    onChange={handleChange}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-700 font-semibold">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    value={form.lastName}
                    onChange={handleChange}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    value={form.email}
                    onChange={handleChange}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700 font-semibold">Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="0762538318" 
                    value={form.phone}
                    onChange={handleChange}
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900"
                    inputMode="numeric"
                    pattern="\d*"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service" className="text-gray-700 font-semibold">Service Interested In</Label>
                <select 
                  id="service" 
                  value={form.service}
                  onChange={handleChange}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900"
                >
                  <option value="">Select a service</option>
                  <option value="education">Education Services</option>
                  <option value="send-me">Send Me Services</option>
                  <option value="it-solutions">IT Solutions</option>
                  <option value="consultation">Business Consultation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-700 font-semibold">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Tell us about your project or inquiry..."
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-all duration-300 resize-none bg-gray-50 focus:bg-white text-gray-900"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isSending}
              >
                {isSending ? "Sending..." : "Send Message"}
              </Button>
              {status && (
                <div className={`mt-2 text-center text-sm font-semibold ${status.includes("success") ? "text-green-600" : "text-red-600"}`}>{status}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
