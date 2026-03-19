import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ContactSection = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const isValidCellphone = (cell: string) => {
    return /^\d{10,15}$/.test(cell.replace(/\s+/g, ""));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      const apiBase = import.meta.env.VITE_API_URL || "https://ib-backend.ib-innovativesolutions.com/api/";
      const res = await fetch(`${apiBase}contact/send-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          service: form.service,
          message: form.message,
        }),
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
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h3 className="mb-6 text-3xl font-bold text-gray-900">Get In Touch</h3>
              <p className="text-lg leading-relaxed text-gray-600">
                Ready to get started? Contact us today and let us know how we can help you with your needs. Our team is ready to assist you with any questions or service requests.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Phone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-bold text-gray-900">Phone / WhatsApp</h4>
                  <div className="space-y-1">
                    <a href="tel:0684240852" className="block text-gray-600 transition-colors hover:text-blue-600">
                      068 424 0852
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-bold text-gray-900">Email</h4>
                  <div className="space-y-1">
                    <a href="mailto:info@ib-innovativesolutions.com" className="block text-gray-600 transition-colors hover:text-green-600">
                      info@ib-innovativesolutions.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-bold text-gray-900">Location</h4>
                  <span className="block text-gray-600">Available online only</span>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="mb-2 text-xl font-bold text-gray-900">Business Hours</h4>
                  <div className="space-y-1 text-gray-600">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
            <h3 className="mb-6 text-3xl font-bold text-gray-900">Send us a Message</h3>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-semibold text-gray-700">First Name</Label>
                  <Input id="firstName" placeholder="John" value={form.firstName} onChange={handleChange} className="h-12 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-semibold text-gray-700">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} className="h-12 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-gray-700">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" value={form.email} onChange={handleChange} className="h-12 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-semibold text-gray-700">Phone</Label>
                  <Input id="phone" placeholder="0762538318" value={form.phone} onChange={handleChange} className="h-12 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white" inputMode="numeric" pattern="\d*" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service" className="font-semibold text-gray-700">Service Interested In</Label>
                <select
                  id="service"
                  value={form.service}
                  onChange={handleChange}
                  className="h-12 w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <Label htmlFor="message" className="font-semibold text-gray-700">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us about your project or inquiry..."
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  className="resize-none rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <Button type="submit" className="h-12 w-full rounded-lg bg-blue-600 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-blue-700 hover:shadow-xl" disabled={isSending}>
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

export default ContactSection;
