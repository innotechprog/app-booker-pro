import { GraduationCap, Monitor, Send, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

export interface HeroContent {
  title: string;
  subtitle: string;
  description: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
}

export interface PublicServiceItem {
  name: string;
  icon: ComponentType<{ className?: string }>;
  route: string;
  description: string;
  features?: string[];
}

export const heroContent: HeroContent = {
  title: "IB Innovative Solutions",
  subtitle: "Solutions you can trust everyday.",
  description: "We are committed to provide you with best solutions that is beyond your expectation.",
  primaryActionLabel: "Contact Us",
  secondaryActionLabel: "Learn more",
};

export const publicServices: PublicServiceItem[] = [
  {
    name: "Education",
    icon: GraduationCap,
    route: "/education",
    description: "Comprehensive educational support including tutoring, university applications, and career guidance",
  },
  {
    name: "Send Me",
    icon: Send,
    route: "/book-service",
    description: "Personal errand running, delivery services, and on-demand assistance for your daily needs",
  },
  {
    name: "IT Solutions",
    icon: Monitor,
    route: "/book-service",
    description: "Professional IT services including web development, system maintenance, and technical support",
  },
  {
    name: "Job Assistant",
    icon: Sparkles,
    route: "/smart-apply",
    description: "Browse available jobs and apply to many companies at once. AI generates tailored email subjects and bodies—view and edit before sending",
  },
];
