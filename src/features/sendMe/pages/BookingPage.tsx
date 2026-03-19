import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Calendar, CheckCircle, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";

const DEEP_BLUE = "#1e3a5f";

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceType = searchParams.get("service") || "Send Me";

  const [form, setForm] = useState({
    fullName: "",
    cellphone: "",
    email: "",
    alternativeNumber: "",
    address: "",
    date: "",
    time: "",
    specificService: "",
    customService: "",
    urgency: "normal",
    contactMethod: "phone",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    if (!form.fullName.trim() || !form.cellphone.trim() || !form.email.trim() || !form.address.trim()) {
      toast.error("Please complete the required fields.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!/^\d{7,15}$/.test(form.cellphone.trim())) {
      toast.error("Please enter a valid cellphone number (digits only).");
      return false;
    }
    if (form.alternativeNumber.trim() && !/^\d{7,15}$/.test(form.alternativeNumber.trim())) {
      toast.error("Alternative number must contain digits only.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.date || !form.time || !form.specificService) {
      toast.error("Please complete service information.");
      return false;
    }
    if (form.specificService === "other" && !form.customService.trim()) {
      toast.error("Please specify the service you need.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((prev) => (prev < 3 ? ((prev + 1) as 1 | 2 | 3) : prev));
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) return;
    if (!acceptedTerms) {
      toast.error("Please accept the terms and conditions before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const apiBaseRaw = import.meta.env.VITE_API_URL || "https://ib-backend.ib-innovativesolutions.com/api/";
      const apiBase = apiBaseRaw.replace(/\/+$/, "");
      const chosenService = form.specificService === "other" ? form.customService.trim() : form.specificService;

      const res = await fetch(`${apiBase}/contact/send-send-me-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          cellphone: form.cellphone.trim(),
          alternativeNumber: form.alternativeNumber.trim() || null,
          address: form.address.trim(),
          bookingType: serviceType,
          specificService: chosenService || "-",
          preferredDate: form.date,
          preferredTime: form.time,
          urgency: form.urgency,
          preferredContact: form.contactMethod,
          acceptedTerms,
          additionalDetails: form.description?.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send booking email.");
      }

      toast.success("Booking request captured. Our team will contact you shortly.");
      navigate("/contact");
    } catch (err: any) {
      toast.error(err?.message || "Could not submit booking right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO page="booking" />
      <div className="min-h-screen bg-gradient-to-b from-[#0a183d] via-[#183a7a] to-[#07122c]">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/book-service")}
            className="mb-6 text-white/90 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Send Me
          </Button>

          <Card className="border-white/20 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Book {serviceType} Service</CardTitle>
              <CardDescription className="text-white/80">
                Complete the 3 steps below to submit your booking.
              </CardDescription>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs sm:text-sm">
                <div className={`rounded-md px-3 py-2 text-center ${step >= 1 ? "bg-white text-[#1e3a5f] font-semibold" : "bg-white/10 text-white/80"}`}>
                  Step 1: Personal Information
                </div>
                <div className={`rounded-md px-3 py-2 text-center ${step >= 2 ? "bg-white text-[#1e3a5f] font-semibold" : "bg-white/10 text-white/80"}`}>
                  Step 2: Service Information
                </div>
                <div className={`rounded-md px-3 py-2 text-center ${step >= 3 ? "bg-white text-[#1e3a5f] font-semibold" : "bg-white/10 text-white/80"}`}>
                  Step 3: Review & Accept
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {step === 1 && (
                  <div className="space-y-3 rounded-lg border border-white/20 bg-white/5 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Personal Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="fullName" className="text-white">Full Name</Label>
                        <Input id="fullName" placeholder="Enter full name" value={form.fullName} onChange={(e) => update("fullName", e.target.value)} className="mt-1 bg-white text-gray-900 placeholder:text-gray-500" required />
                      </div>
                      <div>
                        <Label htmlFor="cellphone" className="text-white">Cellphone</Label>
                        <Input id="cellphone" placeholder="e.g. 0812345678" inputMode="numeric" value={form.cellphone} onChange={(e) => update("cellphone", e.target.value.replace(/\D/g, ""))} className="mt-1 bg-white text-gray-900 placeholder:text-gray-500" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="mt-1 bg-white text-gray-900 placeholder:text-gray-500" required />
                      </div>
                      <div>
                        <Label htmlFor="alternativeNumber" className="text-white">Alternative Number</Label>
                        <Input id="alternativeNumber" placeholder="Optional" inputMode="numeric" value={form.alternativeNumber} onChange={(e) => update("alternativeNumber", e.target.value.replace(/\D/g, ""))} className="mt-1 bg-white text-gray-900 placeholder:text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-white">Address</Label>
                      <div className="relative mt-1">
                        <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input id="address" placeholder="Street address / area" value={form.address} onChange={(e) => update("address", e.target.value)} className="bg-white pl-10 text-gray-900 placeholder:text-gray-500" required />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="date" className="text-white">Preferred Date</Label>
                        <div className="relative mt-1">
                          <Calendar className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="date" type="date" min={new Date().toISOString().split("T")[0]} value={form.date} onChange={(e) => update("date", e.target.value)} className="bg-white pl-10 text-gray-900" required />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="time" className="text-white">Preferred Time</Label>
                        <div className="relative mt-1">
                          <Clock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input id="time" type="time" value={form.time} onChange={(e) => update("time", e.target.value)} className="bg-white pl-10 text-gray-900" required />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Specific Service</Label>
                      <Select value={form.specificService} onValueChange={(v) => update("specificService", v)}>
                        <SelectTrigger className="mt-1 border-gray-300 bg-white text-gray-900">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent className="border-gray-200 bg-white text-gray-900">
                          <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="grocery-shopping">Grocery Shopping</SelectItem>
                          <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="prescription-pickup">Prescription Pickup</SelectItem>
                          <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="package-delivery">Package Delivery</SelectItem>
                          <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="document-delivery">Document Delivery</SelectItem>
                          <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="appointment-scheduling">Appointment Scheduling</SelectItem>
                          <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="household-tasks">Household Tasks</SelectItem>
                          <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="event-assistance">Event Assistance</SelectItem>
                          <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="childcare-support">Childcare Support</SelectItem>
                          <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.specificService === "other" && (
                      <div>
                        <Label htmlFor="customService" className="text-white">Specify Service</Label>
                        <Input id="customService" placeholder="Describe the service" value={form.customService} onChange={(e) => update("customService", e.target.value)} className="mt-1 bg-white text-gray-900 placeholder:text-gray-500" required />
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-white">Urgency</Label>
                        <Select value={form.urgency} onValueChange={(v) => update("urgency", v)}>
                          <SelectTrigger className="mt-1 border-gray-300 bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-gray-200 bg-white text-gray-900">
                            <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="low">Low</SelectItem>
                            <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="normal">Normal</SelectItem>
                            <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="high">High</SelectItem>
                            <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-white">Preferred Contact</Label>
                        <Select value={form.contactMethod} onValueChange={(v) => update("contactMethod", v)}>
                          <SelectTrigger className="mt-1 border-gray-300 bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-gray-200 bg-white text-gray-900">
                            <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="phone">Phone</SelectItem>
                            <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="email">Email</SelectItem>
                            <SelectItem className="text-gray-900 focus:bg-blue-50 focus:text-gray-900" value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-white">Additional Details</Label>
                      <Textarea id="description" placeholder="Share any extra instructions" value={form.description} onChange={(e) => update("description", e.target.value)} className="mt-1 min-h-[110px] bg-white text-gray-900 placeholder:text-gray-500" />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 rounded-lg border border-white/20 bg-white/5 p-4">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-white/90">Review Your Booking</h3>
                    <div className="grid grid-cols-1 gap-3 text-sm text-white/90 md:grid-cols-2">
                      <p><span className="font-semibold text-white">Full Name:</span> {form.fullName}</p>
                      <p><span className="font-semibold text-white">Cellphone:</span> {form.cellphone}</p>
                      <p><span className="font-semibold text-white">Email:</span> {form.email}</p>
                      <p><span className="font-semibold text-white">Alternative Number:</span> {form.alternativeNumber || "N/A"}</p>
                      <p className="md:col-span-2"><span className="font-semibold text-white">Address:</span> {form.address}</p>
                      <p><span className="font-semibold text-white">Date:</span> {form.date}</p>
                      <p><span className="font-semibold text-white">Time:</span> {form.time}</p>
                      <p><span className="font-semibold text-white">Service:</span> {form.specificService === "other" ? form.customService : form.specificService}</p>
                      <p><span className="font-semibold text-white">Urgency:</span> {form.urgency}</p>
                      <p><span className="font-semibold text-white">Preferred Contact:</span> {form.contactMethod}</p>
                      <p className="md:col-span-2"><span className="font-semibold text-white">Additional Details:</span> {form.description || "N/A"}</p>
                    </div>

                    <label className="mt-2 flex cursor-pointer items-start gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        I accept the terms and conditions and agree to be contacted regarding this booking request.
                      </span>
                    </label>
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    type="button"
                    variant="outlineLight"
                    className="sm:min-w-[120px]"
                    onClick={handleBack}
                    disabled={step === 1 || submitting}
                  >
                    Back
                  </Button>

                  {step < 3 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="text-white hover:opacity-90 sm:min-w-[140px]"
                      style={{ backgroundColor: DEEP_BLUE }}
                      disabled={submitting}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="text-white hover:opacity-90 sm:min-w-[180px]"
                      style={{ backgroundColor: DEEP_BLUE }}
                    >
                      {submitting ? "Submitting..." : "Submit Booking"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default BookingPage;
