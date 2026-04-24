/**
 * Recruiter API – auth, profile, recruitments, and Job Assistant candidates from ib-backend.
 */
const RAW_API_BASE_URL =
  import.meta.env.DEV && !import.meta.env.VITE_API_URL
    ? "/api"
    : (import.meta.env.VITE_API_URL || "https://ib-backend.ib-innovativesolutions.com/api/");
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
  candidates?: { id: number; fullName: string; email: string; phone: string | null; category: string | null; jobTitle?: string | null }[];
  createdAt?: string;
  updatedAt?: string;
}

type RecruiterCreateRecruitmentResponse = {
  success?: boolean;
  message?: string;
  recruitment?: RecruiterRecruitment;
};

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && /^\d+(\.\d+)?$/.test(value.trim())) {
    const n = Number(value.trim());
    return Number.isFinite(n) ? Math.trunc(n) : undefined;
  }
  return undefined;
}

function normalizeRecruitmentRow(row: unknown): RecruiterRecruitment | null {
  if (row == null || typeof row !== "object" || Array.isArray(row)) return null;
  const r = row as Record<string, unknown>;

  const id = toFiniteNumber(r.id ?? r.recruitmentId ?? r.recruitment_id ?? r.recruitmentID);
  if (id === undefined) return null;

  const nameRaw = r.name ?? r.title ?? r.recruitmentName ?? r.recruitment_name;
  const name = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : `Recruitment ${id}`;

  const descriptionRaw = r.description ?? r.desc;
  const description = typeof descriptionRaw === "string" ? descriptionRaw : null;

  const candidatesRaw =
    (Array.isArray(r.candidates) ? r.candidates : undefined) ||
    (Array.isArray(r.candidateList) ? r.candidateList : undefined) ||
    (Array.isArray(r.candidates_list) ? r.candidates_list : undefined) ||
    (r.candidates && typeof r.candidates === "object" && !Array.isArray(r.candidates) && Array.isArray((r.candidates as Record<string, unknown>).data)
      ? ((r.candidates as Record<string, unknown>).data as unknown[])
      : undefined);
  const candidateCount =
    toFiniteNumber(r.candidateCount ?? r.candidate_count ?? r.candidatesCount ?? r.candidates_count ?? r.totalCandidates ?? r.total_candidates) ??
    (candidatesRaw ? candidatesRaw.length : undefined);

  return {
    ...(row as RecruiterRecruitment),
    id,
    name,
    description,
    candidateCount,
    candidates: candidatesRaw as RecruiterRecruitment["candidates"],
  };
}

export interface RecruiterJobApplication {
  id: number | string;
  candidateId: number;
  status: "pending" | "accepted" | "rejected";
  stage?: "applied" | "shortlisted" | "interview" | "hired" | "rejected";
  interviewInviteSentAt?: string | null;
  appliedAt: string;
  fullName: string;
  email: string;
  phone: string | null;
  category: string | null;
}

/** Resolve jobs array from common API envelope shapes (`jobs`, `data.jobs`, `results`, etc.). */
function extractJobsFromListPayload(data: unknown): unknown[] {
  if (!data || typeof data !== "object") return [];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.jobs)) return o.jobs;
  if (Array.isArray(o.results)) return o.results;
  if (Array.isArray(o.items)) return o.items;
  if (Array.isArray(o.data)) return o.data;
  const nested = o.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    const d = nested as Record<string, unknown>;
    if (Array.isArray(d.jobs)) return d.jobs;
    if (Array.isArray(d.data)) return d.data;
  }
  return [];
}

/** Map list/detail payloads that use snake_case or alternate keys to a stable primary key for routing. */
function normalizeRecruiterJobRow(row: unknown, depth = 0): RecruiterJob | null {
  if (depth > 2) return null;
  if (typeof row === "string") {
    try {
      return normalizeRecruiterJobRow(JSON.parse(row) as unknown, depth + 1);
    } catch {
      return null;
    }
  }
  if (row == null || typeof row !== "object" || Array.isArray(row)) return null;
  const base = row as RecruiterJob;
  const r = row as Record<string, unknown>;

  const pk =
    r.id ??
    r.jobId ??
    r.job_id ??
    r.recruiter_job_id ??
    r.recruiterJobId ??
    r.externalJobId ??
    r.external_job_id ??
    r.uuid ??
    r.job_uuid;

  const pkNum =
    typeof pk === "number" && Number.isFinite(pk)
      ? Math.trunc(pk)
      : typeof pk === "string" && /^\d+$/.test(pk.trim())
        ? Number(pk.trim())
        : undefined;

  let id: number | undefined =
    typeof r.id === "number" && Number.isFinite(r.id)
      ? Math.trunc(r.id)
      : typeof base.id === "number" && Number.isFinite(base.id)
        ? Math.trunc(base.id)
        : undefined;

  if (id === undefined && typeof r.id === "string" && /^\d+$/.test(r.id.trim())) {
    id = Number(r.id.trim());
  }
  if (id === undefined && pkNum !== undefined) {
    id = pkNum;
  }

  let jobId: string | undefined =
    typeof r.jobId === "string" && r.jobId.trim()
      ? r.jobId.trim()
      : typeof base.jobId === "string" && base.jobId.trim()
        ? base.jobId.trim()
        : undefined;

  if (jobId === undefined && typeof pk === "string" && pk.trim() && pkNum === undefined) {
    jobId = pk.trim();
  }
  if (jobId === undefined && id !== undefined) {
    jobId = String(id);
  }
  if (jobId === undefined && typeof r.id === "string" && r.id.trim()) {
    const t = r.id.trim();
    if (!/^\d+$/.test(t)) jobId = t;
  }

  const hasRouteKey = id !== undefined || (jobId !== undefined && jobId.length > 0);
  if (!hasRouteKey) {
    return base;
  }

  return { ...base, id, jobId };
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

/** Route segment for `/recruiter/jobs/:id` from list/detail job objects. */
export function recruiterJobRouteId(job: RecruiterJob): string | undefined {
  const r = job as unknown as Record<string, unknown>;

  const toKey = (v: unknown): string | undefined => {
    if (typeof v === "number") {
      if (!Number.isFinite(v)) return undefined;
      return String(Math.trunc(v));
    }
    if (typeof v === "string") {
      const t = v.trim();
      if (!t) return undefined;
      if (/^\d+(\.\d+)?$/.test(t)) {
        const n = Number(t);
        if (Number.isFinite(n)) return String(Math.trunc(n));
      }
      return t;
    }
    return undefined;
  };

  const nestedJob =
    (r.job && typeof r.job === "object" ? (r.job as Record<string, unknown>) : undefined) ||
    (r.job_details && typeof r.job_details === "object" ? (r.job_details as Record<string, unknown>) : undefined) ||
    (r.recruitment_job && typeof r.recruitment_job === "object" ? (r.recruitment_job as Record<string, unknown>) : undefined) ||
    undefined;

  const findJobIdLike = (obj: Record<string, unknown> | undefined): string | undefined => {
    if (!obj) return undefined;
    for (const key of Object.keys(obj)) {
      const lk = key.toLowerCase();
      const val = obj[key];
      if (lk === "id" || lk === "uuid") {
        const k = toKey(val);
        if (k) return k;
      }
      if (lk.includes("job") && (lk.endsWith("_id") || lk.endsWith("id") || lk.includes("jobid"))) {
        const k = toKey(val);
        if (k) return k;
      }
    }
    return undefined;
  };

  return (
    toKey(r.id) ??
    toKey(r.jobId) ??
    toKey(r.job_id) ??
    toKey(r.recruiter_job_id) ??
    toKey(r.recruiterJobId) ??
    toKey(r.externalJobId) ??
    toKey(r.external_job_id) ??
    toKey(r.uuid) ??
    toKey(r.job_uuid) ??
    (nestedJob ? toKey(nestedJob.id) : undefined) ??
    (nestedJob ? toKey(nestedJob.jobId) : undefined) ??
    (nestedJob ? toKey(nestedJob.job_id) : undefined) ??
    (nestedJob ? toKey(nestedJob.external_job_id) : undefined) ??
    findJobIdLike(r) ??
    findJobIdLike(nestedJob)
  );
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
  jobTitle?: string | null;
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

  async deactivateAccount(password: string) {
    const res = await authFetch("/recruiter/auth/deactivate", {
      method: "PUT",
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Failed to deactivate account");
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
    const root = data as Record<string, unknown>;
    const listRaw =
      (Array.isArray(root.recruitments) ? root.recruitments : undefined) ||
      (Array.isArray(root.data) ? root.data : undefined) ||
      (root.data && typeof root.data === "object" && Array.isArray((root.data as Record<string, unknown>).recruitments)
        ? ((root.data as Record<string, unknown>).recruitments as unknown[])
        : undefined) ||
      [];
    const recruitments = listRaw
      .map((row) => normalizeRecruitmentRow(row))
      .filter((r): r is RecruiterRecruitment => r != null);
    return { success: !!root.success, recruitments };
  },

  async createRecruitment(payload: { name: string; description?: string }): Promise<RecruiterCreateRecruitmentResponse> {
    const res = await authFetch("/recruiter/recruitments", {
      method: "POST",
      // Some backend versions accept "title" instead of "name".
      body: JSON.stringify({
        name: payload.name,
        title: payload.name,
        description: payload.description,
      }),
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok) {
      const message =
        (typeof data.message === "string" && data.message) ||
        (typeof data.error === "string" && data.error) ||
        "Failed to create recruitment";
      throw new Error(message);
    }

    const recruitment =
      (data as { recruitment?: RecruiterRecruitment }).recruitment ||
      (data as { data?: { recruitment?: RecruiterRecruitment } }).data?.recruitment ||
      (data as { item?: RecruiterRecruitment }).item;

    return {
      ...(data as Record<string, unknown>),
      recruitment,
    } as RecruiterCreateRecruitmentResponse;
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
    const raw = extractJobsFromListPayload(data);
    const jobs = raw.map((row: unknown) => normalizeRecruiterJobRow(row)).filter((j): j is RecruiterJob => j != null);
    return { success: !!data.success, jobs };
  },

  async createJob(payload: CreateJobPayload) {
    const res = await authFetch("/recruiter/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok) throw new Error((data as { error?: string; message?: string }).error || (data as { message?: string }).message || "Failed to create job");

    const root = data as Record<string, unknown>;
    const nested = (root.data && typeof root.data === "object" ? (root.data as Record<string, unknown>) : undefined) || undefined;

    const jobRaw =
      (root.job as unknown) ||
      (root.recruiter_job as unknown) ||
      (nested?.job as unknown) ||
      (nested?.recruiter_job as unknown) ||
      (Array.isArray(root.jobs) && root.jobs.length > 0 ? (root.jobs as unknown[])[0] : undefined) ||
      (Array.isArray(nested?.jobs) && (nested!.jobs as unknown[]).length > 0 ? (nested!.jobs as unknown[])[0] : undefined);

    if (jobRaw) {
      const normalized = normalizeRecruiterJobRow(jobRaw);
      const job = normalized ?? (jobRaw as RecruiterJob);
      return { ...data, job } as { job: RecruiterJob } & typeof data;
    }

    return data as Record<string, unknown>;
  },

  async getJob(id: number | string): Promise<{ success: boolean; job: RecruiterJobWithApplications }> {
    const res = await authFetch(`/recruiter/jobs/${encodeURIComponent(String(id))}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 404) throw new Error("Job not found");
      throw new Error(data.error || "Failed to load job");
    }
    if (data.job) {
      const j = data.job as RecruiterJobWithApplications;
      const normalized = normalizeRecruiterJobRow(j) ?? j;
      return { ...data, job: { ...j, ...normalized } };
    }
    return data;
  },

  async updateJob(
    id: number | string,
    payload: Partial<CreateJobPayload & { status: "draft" | "posted" }>,
  ) {
    const res = await authFetch(`/recruiter/jobs/${encodeURIComponent(String(id))}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to update job");
    return data;
  },

  async deleteJob(id: number | string) {
    const res = await authFetch(`/recruiter/jobs/${encodeURIComponent(String(id))}`, { method: "DELETE" });
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

  async setApplicationStatus(jobId: number | string, applicationId: number | string, status: "accepted" | "rejected") {
    const res = await authFetch(`/recruiter/jobs/${encodeURIComponent(String(jobId))}/applications/${encodeURIComponent(String(applicationId))}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Failed to update application");
    return data;
  },

  async setApplicationStage(jobId: number | string, applicationId: number | string, stage: "applied" | "shortlisted" | "interview" | "hired" | "rejected") {
    const res = await authFetch(`/recruiter/jobs/${encodeURIComponent(String(jobId))}/applications/${encodeURIComponent(String(applicationId))}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "Failed to set stage");
    return data;
  },

  async getSearchSuggestions(): Promise<{ success: boolean; suggestions: string[] }> {
    const res = await authFetch("/recruiter/search-suggestions");
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "Failed to get suggestions");
    return data;
  },

  async addSearchSuggestion(query: string) {
    const res = await authFetch("/recruiter/search-suggestions", {
      method: "POST",
      body: JSON.stringify({ query: query.trim().slice(0, 500) }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "Failed to add suggestion");
    return data;
  },

  async sendInterviewInvitation(jobId: number | string, applicationId: number | string) {
    const res = await authFetch(`/recruiter/jobs/${encodeURIComponent(String(jobId))}/applications/${encodeURIComponent(String(applicationId))}/send-interview-invite`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || "Failed to send invitation");
    return data;
  },
};
