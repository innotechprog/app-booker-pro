import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
import { formatTripBookingDetails, submitSendMeBooking } from "@/features/sendMe/api/sendMeBooking";
import { SEND_ME_BTN_GHOST_ON_DARK } from "@/features/sendMe/buttonStyles";
import { getBookingSpecificServiceLabel } from "@/features/sendMe/constants";
import { sendMeDarkPageShell } from "@/features/sendMe/constants/layout";
import { validateBookingStep1, validateBookingStep2 } from "@/features/sendMe/utils/bookingValidation";
import type { BookingFormData, BookingStep } from "@/features/sendMe/types";

const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const serviceFromQuery = searchParams.get("service")?.trim();
  const serviceFromNavState = (location.state as { service?: string } | null)?.service?.trim();
  const serviceType = serviceFromQuery || serviceFromNavState || "Send Me";

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
    tripPickup: "",
    tripDropoff: "",
    tripStops: [],
    urgency: "normal",
    contactMethod: "phone",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<BookingStep>(1);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const update = <K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSpecificServiceChange = (v: string) => {
    setForm((prev) => ({
      ...prev,
      specificService: v,
      ...(v !== "trip" ? { tripPickup: "", tripDropoff: "", tripStops: [] as string[] } : {}),
    }));
  };

  const validateStep1 = () => {
    const msg = validateBookingStep1(form);
    if (msg) {
      toast.error(msg);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const msg = validateBookingStep2(form);
    if (msg) {
      toast.error(msg);
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
      const chosenService =
        form.specificService === "other"
          ? form.customService.trim()
          : getBookingSpecificServiceLabel(form.specificService);

      const userNotes = form.description?.trim() ?? "";
      const tripStopsFiltered =
        form.specificService === "trip" ? form.tripStops.map((s) => s.trim()).filter(Boolean) : [];

      let additionalDetails: string | null;
      if (form.specificService === "trip") {
        const tripBlock = formatTripBookingDetails(form.tripPickup, form.tripDropoff, tripStopsFiltered);
        additionalDetails = userNotes ? `${tripBlock}\n\n${userNotes}` : tripBlock;
      } else {
        additionalDetails = userNotes || null;
      }

      // Optional trip* fields for APIs that support them; trip routing is always in additionalDetails above.
      const tripPayload =
        form.specificService === "trip"
          ? {
              tripPickup: form.tripPickup.trim(),
              tripDropoff: form.tripDropoff.trim(),
              ...(tripStopsFiltered.length > 0 ? { tripStops: tripStopsFiltered } : {}),
            }
          : {};

      await submitSendMeBooking({
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
        additionalDetails,
        ...tripPayload,
      });

      navigate("/booking/success", { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not submit booking right now. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO page="booking" />
      <div className={sendMeDarkPageShell}>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/book-service")}
            className={`mb-6 ${SEND_ME_BTN_GHOST_ON_DARK}`}
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
                {step === 2 && (
                  <BookingServiceInfoStep form={form} update={update} onSpecificServiceChange={handleSpecificServiceChange} />
                )}
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
