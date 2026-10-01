import type { CvPreviewData } from "./types";

/** Polished demo data for template cards on the CV builder grid */
export const SAMPLE_CV_PREVIEW_DATA: CvPreviewData = {
  personal: {
    fullName: "Alex Morgan",
    email: "alex.morgan@email.com",
    phone: "+27 82 000 0000",
    currentLocation: "Johannesburg, South Africa",
    jobTitle: "Full Stack Software Developer",
    linkedinUrl: "linkedin.com/in/alexmorgan",
    website: "alexmorgan.dev",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    profilePictureUrl: undefined,
    showProfilePictureOnCv: false,
  },
  overview:
    "Results-driven software developer with hands-on experience building modern web applications. Skilled in React, Node.js, and cloud tools, with a strong focus on clean code, collaboration, and delivering measurable impact.",
  workExperience: [
    {
      jobTitle: "Software Developer",
      company: "TTCH Technologies",
      startDate: "2023",
      endDate: "Present",
      description:
        "Built and maintained full-stack features for client products.\nCollaborated with designers and stakeholders to ship user-friendly interfaces.\nImproved application performance and reliability across releases.",
    },
    {
      jobTitle: "Junior Developer",
      company: "Digital Studio",
      startDate: "2021",
      endDate: "2023",
      description:
        "Developed responsive front-end components and REST API integrations.\nSupported testing, bug fixes, and continuous delivery workflows.",
    },
  ],
  education: [
    {
      qualification: "BSc Computer Science",
      institution: "University of Johannesburg",
      startDate: "2018",
      endDate: "2021",
    },
  ],
  certifications: [
    { name: "Azure Fundamentals", issuer: "Microsoft", date: "2024" },
    { name: "Web Development Certificate", issuer: "Coursera", date: "2022" },
  ],
  keySkills: [
    { name: "React", level: "Advanced" },
    { name: "TypeScript", level: "Advanced" },
    { name: "Node.js", level: "Advanced" },
    { name: "SQL", level: "Intermediate" },
    { name: "UI Design", level: "Intermediate" },
    { name: "Problem Solving", level: "Expert" },
  ],
  accentColor: "#1a2b4b",
  customSections: [
    {
      id: "preview-languages",
      title: "Languages",
      content: "English — Native\nZulu — Conversational",
    },
  ],
};
