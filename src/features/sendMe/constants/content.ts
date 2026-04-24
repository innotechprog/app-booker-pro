import { Clock, MapPin, Shield, Users } from "lucide-react";
import type { ComponentType } from "react";

export interface SendMeReason {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export const sendMeHeroContent = {
  eyebrow: "On-Demand Personal Assistance",
  title: "Send Me",
  description:
    "Personal errand running, delivery services, and on-demand assistance. We handle the tasks so you can focus on what matters—across Gauteng and South Africa.",
  ctaLabel: "Book Service",
  highlights: ["Errands & Delivery", "Personal Assistance", "Gauteng & SA"],
} as const;

export const sendMeServicesIntro = {
  title: "Our Send Me Services",
  description:
    "We go beyond basic errands. Need us to source car parts, buy items on your behalf, collect documents, or handle custom requests? Tell us what you need and we will handle it end-to-end.",
} as const;

export const sendMeCustomRequestContent = {
  eyebrow: "Custom Requests",
  title: "Need something not listed? We can still help.",
  description:
    "Send Me is flexible by design. If your request is not in the service cards above, share the details and we will arrange it for you.",
  ctaLabel: "Request a Custom Task",
} as const;

export const sendMeHowItWorksTitle = "How It Works";

export const sendMeHowItWorksSteps = [
  {
    title: "Tell us what you need",
    description: "Choose a service type, date, time, and location. Add any special instructions.",
  },
  {
    title: "We confirm & quote",
    description: "We will confirm your booking and provide a clear quote. Pay when you are ready.",
  },
  {
    title: "We get it done",
    description: "Our team handles your task on the agreed date. We keep you updated.",
  },
] as const;

export const sendMeReasonsTitle = "Why Choose Send Me?";

export const sendMeReasons: SendMeReason[] = [
  {
    title: "Flexible & On-demand",
    description: "Book for same day, next day, or in advance. We work around your schedule.",
    icon: Clock,
  },
  {
    title: "Gauteng & Beyond",
    description: "We operate across Gauteng and can arrange services in other regions.",
    icon: MapPin,
  },
  {
    title: "Trusted & Reliable",
    description: "Professional, vetted helpers. Your time and tasks are in safe hands.",
    icon: Shield,
  },
  {
    title: "Personal Touch",
    description: "Clear communication and updates so you are always in the loop.",
    icon: Users,
  },
];

export const sendMeFinalCta = {
  title: "Ready to Send Me?",
  description: "Book your errand, delivery, or personal assistance task in a few clicks. We will take it from there.",
  ctaLabel: "Book Service",
  footnote: "Prefer WhatsApp or call-back? Submit the booking form and choose your preferred contact method.",
} as const;

/** Booking flow — Terms & Conditions sections (review step). */
export const sendMeBookingTermsClauses = [
  {
    heading: "1. Service Agreement",
    body: 'By submitting this booking request, you authorise IB Innovative Solutions ("IB Send Me") to act on your behalf to fulfil the errand or task described. All services are subject to availability and operational hours.',
  },
  {
    heading: "2. Accurate Information",
    body: "You agree to provide accurate, complete, and truthful information in this form. IB Send Me reserves the right to decline or cancel a booking if the information provided is found to be inaccurate or misleading.",
  },
  {
    heading: "3. Payment & Pricing",
    body: "A quote will be provided before service commencement. Payment is due upon confirmation of the quote. IB Send Me reserves the right to adjust the final price if the scope of the task changes after confirmation.",
  },
  {
    heading: "4. Cancellation Policy",
    body: "Cancellations made more than 24 hours before the scheduled service date are free of charge. Cancellations within 24 hours may incur a cancellation fee of up to 50% of the agreed service cost.",
  },
  {
    heading: "5. Liability",
    body: "IB Send Me will handle all items and tasks with reasonable care. We are not liable for pre-existing damage, loss due to third-party delays, or circumstances beyond our reasonable control (force majeure). Maximum liability is limited to the value of the service fee paid.",
  },
  {
    heading: "6. Privacy",
    body: "Your personal information is collected solely to process and fulfil your booking. We do not sell or share your data with third parties, except where necessary to deliver the service (e.g., delivery partners). View our full Privacy Policy on request.",
  },
  {
    heading: "7. Communication",
    body: "By accepting these terms, you consent to being contacted by IB Send Me via the contact method you selected, regarding this booking and related service updates.",
  },
  {
    heading: "8. Governing Law",
    body: "These terms are governed by the laws of the Republic of South Africa. Any disputes will be resolved in the courts of South Africa.",
  },
] as const;
