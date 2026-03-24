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
    "Personal errand running, delivery services, and on-demand assistance. We handle the tasks so you can focus on what matters-across Gauteng and South Africa.",
  ctaLabel: "Book Send Me Service",
  highlights: ["Errands & Delivery", "Personal Assistance", "Gauteng & SA"],
} as const;

export const sendMeServicesIntro = {
  eyebrow: "Core Services",
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
  ctaLabel: "Book Send Me Service",
  footnote: "Prefer WhatsApp or call-back? Submit the booking form and choose your preferred contact method.",
} as const;
