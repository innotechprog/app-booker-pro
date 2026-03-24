import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  BookingFormActions,
  BookingPersonalInfoStep,
  BookingReviewStep,
  BookingServiceInfoStep,
  BookingStepIndicator,
} from "@/features/sendMe/components";
import type { BookingFormData, BookingStep } from "@/features/sendMe/types";

const DEEP_BLUE = "#1e3a5f";

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const serviceType = searchParams.get("service") || "Send Me";

  const [form, setForm] = useState<BookingFormData>({
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
  const [step, setStep] = useState<BookingStep>(1);
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
    setStep((prev) => (prev < 3 ? ((prev + 1) as BookingStep) : prev));
  };

  const handleBack = () => {
    setStep((prev) => (prev > 1 ? ((prev - 1) as BookingStep) : prev));
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
              <BookingStepIndicator step={step} />
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {step === 1 && <BookingPersonalInfoStep form={form} update={update} />}
                {step === 2 && <BookingServiceInfoStep form={form} update={update} />}
                {step === 3 && (
                  <BookingReviewStep
                    form={form}
                    acceptedTerms={acceptedTerms}
                    setAcceptedTerms={setAcceptedTerms}
                  />
                )}

                <BookingFormActions
                  step={step}
                  submitting={submitting}
                  onBack={handleBack}
                  onNext={handleNext}
                  submitColor={DEEP_BLUE}
                />
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
