/**
 * Recruiter API – auth, profile, recruitments, and Smart Apply candidates from ib-backend.
 */
const RAW_API_BASE_URL =
  import.meta.env.DEV && !import.meta.env.VITE_API_URL
    ? "/api"
    : (import.meta.env.VITE_API_URL || "http://localhost:5000/api");
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, "");

export const RECRUITER_TOKEN_KEY = "recruiter_token";

function getRecruiterToken(): string | null {
  return localStorage.getItem(RECRUITER_TOKEN_KEY);
}

async function fetchWithRecruiterAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getRecruiterToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const path = url.startsWith("/") ? url : `/${url}`;
  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
}

/** Use for protected routes; on 401 clears token and throws so caller can redirect to sign-in. */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetchWithRecruiterAuth(url, options);
  if (res.status === 401) {
    localStorage.removeItem(RECRUITER_TOKEN_KEY);
    throw new Error("Session expired");
  }
  return res;
}

export interface RecruiterProfile {
  id: number;
  fullName: string;
  email: string;
  company: string | null;
  phone: string | null;
}

export interface RecruiterRecruitment {
  id: number;
  name: string;
  description: string | null;
  candidateCount?: number;
  candidates?: { id: number; fullName: string; email: string; phone: string | null; category: string | null }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruiterJobApplication {
  id: number;
  candidateId: number;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
  fullName: string;
  email: string;
  phone: string | null;
  category: string | null;
}

export interface RecruiterJob {
  id?: number;
  jobId?: string;
  title: string;
  description?: string | null;
  status: "draft" | "posted";
  applicationCount?: number;
  createdAt?: string;
  updatedAt?: string;
  jobIntro?: string | null;
  jobTitle?: string | null;
  jobDesc?: string | null;
  reportingTo?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  jobSalary?: string | null;
  currency?: string | null;
  salInterval?: string | null;
  postType?: string | null;
  workMethod?: string | null;
  startDate?: string | null;
  applicationLink?: string | null;
  qualification?: string | null;
  experience?: string | null;
  positionLevel?: string | null;
  numPos?: number | null;
  unsuccessfulPeriod?: number | null;
  datePosted?: string | null;
  closingDate?: string | null;
  externalJobId?: string | null;
  compId?: number | null;
  companyId?: number | null;
}

export type CreateJobPayload = {
  title: string;
  description?: string;
  status?: "draft" | "posted";
  jobIntro?: string;
  jobTitle?: string;
  jobDesc?: string;
  reportingTo?: string;
  minSalary?: number;
  maxSalary?: number;
  jobSalary?: string;
  currency?: string;
  salInterval?: string;
  postType?: string;
  workMethod?: string;
  startDate?: string;
  applicationLink?: string;
  qualification?: string;
  experience?: string;
  positionLevel?: string;
  numPos?: number;
  datePosted?: string;
  closingDate?: string;
  externalJobId?: string;
  compId?: number;
  companyId?: number;
};

export interface RecruiterJobWithApplications extends RecruiterJob {
  applications: RecruiterJobApplication[];
}

export interface RecruiterCandidateListItem {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  category: string | null;
  createdAt: string | null;
  profilePicture?: string | null;
  publicCvUrl?: string | null;
}

export interface RecruiterCandidateProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  currentLocation: string | null;
  jobTitle: string | null;
  linkedinUrl: string | null;
  website: string | null;
  category: string | null;
  overview: string | null;
  workExperience: Array<Record<string, unknown>>;
  education: Array<Record<string, unknown>>;
  certifications: Array<Record<string, unknown>>;
  keySkills: Array<Record<string, unknown>>;
  primaryCvId: number | null;
  profilePicture: string | null;
  publicCvSlug: string | null;
  publicCvUrl: string | null;
  addresses: Array<{
    id: number;
    label: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    stateRegion: string | null;
    postalCode: string | null;
    country: string;
    isPrimary: boolean;
  }>;
}

export const recruiterApi = {
  async getCandidates(params?: {
    category?: "general" | "professional";
    search?: string;
    skills?: string;
    location?: string;
    experience?: string;
  }): Promise<{ success: boolean; candidates: RecruiterCandidateListItem[] }> {
    const sp = new URLSearchParams();
    if (params?.category) sp.set("category", params.category);
    if (params?.search?.trim()) sp.set("search", params.search.trim());
    if (params?.skills?.trim()) sp.set("skills", params.skills.trim());
    if (params?.location?.trim()) sp.set("location", params.location.trim());
    if (params?.experience?.trim()) sp.set("experience", params.experience.trim());
    const q = sp.toString() ? `?${sp.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/smart-apply/candidates${q}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Server error: ${res.status}`);
    }
    return res.json();
  },

  async getCandidateById(id: number): Promise<{ success: boolean; profile: RecruiterCandidateProfile }> {
    const res = await fetch(`${API_BASE_URL}/smart-apply/candidates/${id}`);
    if (!res.ok) {
      if (res.status === 404) throw new Error("Candidate not found");
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Server error: ${res.status}`);
    }
    return res.json();
  },

  async getCandidateCvBlob(id: number): Promise<Blob> {
    const token = getRecruiterToken();
    const res = await fetch(`${API_BASE_URL}/recruiter/candidates/${id}/cv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      if (res.status === 404) throw new Error("CV not found");
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || data.error || `Server error: ${res.status}`);
    }
    return res.blob();
  },

  // ---------- Auth ----------
  async register(payload: { fullName: string; email: string; password: string; company?: string; phone?: string }) {
    const res = await fetch(`${API_BASE_URL}/recruiter/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Registration failed");
    if (data.token) localStorage.setItem(RECRUITER_TOKEN_KEY, data.token);
    return data;
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/recruiter/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Invalid email or password");
    if (data.token) localStorage.setItem(RECRUITER_TOKEN_KEY, data.token);
    return data;
  },

  logout() {
    localStorage.removeItem(RECRUITER_TOKEN_KEY);
  },

  hasToken(): boolean {
    return !!getRecruiterToken();
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await authFetch("/recruiter/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Failed to change password");
    return data;
  },

  // ---------- Profile ----------
  async getProfile(): Promise<{ success: boolean; profile: RecruiterProfile }> {
    const res = await authFetch("/recruiter/profile");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Failed to load profile");
    return data;
  },

  async saveProfile(payload: { fullName?: string; company?: string; phone?: string }) {
    const res = await authFetch("/recruiter/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || "Failed to update profile");
    return data;
  },

  // ---------- Recruitments ----------
  async getRecruitments(): Promise<{ success: boolean; recruitments: RecruiterRecruitment[] }> {
    const res = await authFetch("/recruiter/recruitments");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to list recruitments");
    return data;
  },

  async createRecruitment(payload: { name: string; description?: string }) {
    const res = await authFetch("/recruiter/recruitments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to create recruitment");
    return data;
  },

  async getRecruitment(id: number): Promise<{ success: boolean; recruitment: RecruiterRecruitment }> {
    const res = await authFetch(`/recruiter/recruitments/${id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) throw new Error("Recruitment not found");
      throw new Error(data.error || "Failed to load recruitment");
    }
    return data;
  },

  async updateRecruitment(id: number, payload: { name?: string; description?: string }) {
    const res = await authFetch(`/recruiter/recruitments/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to update recruitment");
    return data;
  },

  async deleteRecruitment(id: number) {
    const res = await authFetch(`/recruiter/recruitments/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to delete recruitment");
    return data;
  },

  async addCandidateToRecruitment(recruitmentId: number, candidateId: number) {
    const res = await authFetch(`/recruiter/recruitments/${recruitmentId}/candidates`, {
      method: "POST",
      body: JSON.stringify({ candidateId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to add candidate");
    return data;
  },

  async removeCandidateFromRecruitment(recruitmentId: number, candidateId: number) {
    const res = await authFetch(`/recruiter/recruitments/${recruitmentId}/candidates/${candidateId}`, {
      method: "DELETE",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to remove candidate");
    return data;
  },

  // ---------- Jobs ----------
  async getJobs(): Promise<{ success: boolean; jobs: RecruiterJob[] }> {
    const res = await authFetch("/recruiter/jobs");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to list jobs");
    return data;
  },

  async createJob(payload: CreateJobPayload) {
    const res = await authFetch("/recruiter/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to create job");
    return data;
  },

  async getJob(id: number): Promise<{ success: boolean; job: RecruiterJobWithApplications }> {
    const res = await authFetch(`/recruiter/jobs/${id}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) throw new Error("Job not found");
      throw new Error(data.error || "Failed to load job");
    }
    return data;
  },

  async updateJob(id: number, payload: { title?: string; description?: string; status?: "draft" | "posted" }) {
    const res = await authFetch(`/recruiter/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to update job");
    return data;
  },

  async deleteJob(id: number) {
    const res = await authFetch(`/recruiter/jobs/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to delete job");
    return data;
  },

  async addApplication(jobId: number, candidateId: number) {
    const res = await authFetch(`/recruiter/jobs/${jobId}/applications`, {
      method: "POST",
      body: JSON.stringify({ candidateId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to add application");
    return data;
  },

  async setApplicationStatus(jobId: number, applicationId: number, status: "accepted" | "rejected") {
    const res = await authFetch(`/recruiter/jobs/${jobId}/applications/${applicationId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to update application");
    return data;
  },
};
