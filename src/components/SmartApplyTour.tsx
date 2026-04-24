/**
 * Job Assistant onboarding tour – shows new candidates what they can do on the site.
 * Runs after first CV upload. Uses driver.js for the guided tour.
 */
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

function findVisibleTourElement(selector: string): (() => Element | undefined) {
  return () => {
    const els = document.querySelectorAll(selector);
    for (const el of els) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) return el as Element;
    }
    return (els[0] as Element) || undefined;
  };
}

const TOUR_STEPS: DriveStep[] = [
  {
    element: undefined,
    popover: {
      title: "Welcome to Job Assistant!",
      description: "Your CV is uploaded. Here's a quick tour of what you can do on the site.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "[data-tour='profile-cvs']",
    popover: {
      title: "My CVs",
      description: "Upload multiple CVs for different roles. Set a default CV for applications. View, download, or delete any CV anytime.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "[data-tour='profile-overview']",
    popover: {
      title: "Profile overview",
      description: "Add a short summary for recruiters. This helps them match you to the right jobs.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: findVisibleTourElement("[data-tour='nav-dashboard']"),
    popover: {
      title: "Dashboard",
      description: "See your applications, matching jobs, and resume analytics (views, downloads, link clicks).",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: findVisibleTourElement("[data-tour='nav-apply']"),
    popover: {
      title: "Apply to multiple emails",
      description: "Send your CV to many companies at once. Add recipient emails, customize your message, and apply in one go.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: findVisibleTourElement("[data-tour='nav-jobs']"),
    popover: {
      title: "Find a job",
      description: "Browse jobs posted by recruiters. Apply directly from the job listing.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: findVisibleTourElement("[data-tour='nav-cv-builder']"),
    popover: {
      title: "CV Builder",
      description: "Create a professional online CV with templates. Share a link so recruiters can view and download it.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: undefined,
    popover: {
      title: "You're all set!",
      description: "Explore the site, complete your profile, and start applying. Good luck with your job search!",
      side: "bottom",
      align: "center",
    },
  },
];

/** Run the Job Assistant tour. Calls onComplete when the tour is finished or dismissed. */
export function runJobAssistantTour(onComplete?: () => void): void {
  let completed = false;
  const runComplete = () => {
    if (!completed) {
      completed = true;
      onComplete?.();
    }
  };

  const driverObj = driver({
    showProgress: true,
    steps: TOUR_STEPS,
    progressText: "{{current}} of {{total}}",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Got it",
    smoothScroll: true,
    onDestroyed: () => runComplete(),
  });

  requestAnimationFrame(() => {
    if (window.innerWidth < 768) {
      document.getElementById("smart-apply-mobile-menu-btn")?.click();
    }
    setTimeout(() => driverObj.drive(), 100);
  });
}

export default { runJobAssistantTour };
