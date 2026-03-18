// API Service for Backend Communication

// In dev, use relative /api so Vite proxies to backend (avoids CORS). Set VITE_API_URL to override (e.g. direct to backend).
const RAW_API_BASE_URL = (import.meta.env.DEV && !import.meta.env.VITE_API_URL) ? '/api' : (import.meta.env.VITE_API_URL || 'https://ib-backend.ib-innovativesolutions.com/api/');
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');

// Helper to get auth token
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = 'API request failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Handle network errors (Failed to fetch)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`Cannot connect to server. Please make sure the backend server is running on ${API_BASE_URL}`);
    }
    // Re-throw other errors
    throw error;
  }
};

// =============================================
// AUTH API
// =============================================

export const authAPI = {
  register: async (userData: { fullName: string; email: string; password: string; grade?: string; phone?: string }) => {
    const data = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('learner_current', JSON.stringify({ email: data.user.email }));
      localStorage.setItem('learnerData', JSON.stringify(data.user));
    }
    
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('learner_current', JSON.stringify({ email: data.user.email }));
      localStorage.setItem('learnerData', JSON.stringify(data.user));
    }
    
    return data;
  },

  logout: async () => {
    try {
      await fetchWithAuth('/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('learner_current');
      localStorage.removeItem('learnerData');
    }
  },

  getCurrentUser: async () => {
    return await fetchWithAuth('/auth/me');
  },

  googleLogin: async (idToken: string) => {
    const data = await fetchWithAuth('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('learner_current', JSON.stringify({ email: data.user.email }));
      localStorage.setItem('learnerData', JSON.stringify(data.user));
    }
    
    return data;
  }
};

// =============================================
// LEARNER API
// =============================================

export const learnerAPI = {
  getProfile: async () => {
    return await fetchWithAuth('/learner/profile');
  },

  updateProfile: async (profileData: any) => {
    return await fetchWithAuth('/learner/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  getSubjects: async () => {
    return await fetchWithAuth('/learner/subjects');
  },

  addSubject: async (subjectName: string) => {
    return await fetchWithAuth('/learner/subjects', {
      method: 'POST',
      body: JSON.stringify({ subjectName })
    });
  },

  removeSubject: async (subjectId: number) => {
    return await fetchWithAuth(`/learner/subjects/${subjectId}`, {
      method: 'DELETE'
    });
  },

  getStreak: async () => {
    return await fetchWithAuth('/learner/streak');
  },

  getAchievements: async () => {
    return await fetchWithAuth('/learner/achievements');
  }
};

// =============================================
// NOTES API
// =============================================

export const notesAPI = {
  getAll: async (category?: string) => {
    const url = category ? `/notes?category=${category}` : '/notes';
    return await fetchWithAuth(url);
  },

  create: async (noteData: { title: string; body: string; category: string }) => {
    return await fetchWithAuth('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData)
    });
  },

  update: async (noteId: number, noteData: { title: string; body: string; category: string }) => {
    return await fetchWithAuth(`/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData)
    });
  },

  delete: async (noteId: number) => {
    return await fetchWithAuth(`/notes/${noteId}`, {
      method: 'DELETE'
    });
  }
};

// =============================================
// CALENDAR API
// =============================================

export const calendarAPI = {
  getAll: async (upcomingOnly = false) => {
    const url = upcomingOnly ? '/calendar?upcoming=true' : '/calendar';
    return await fetchWithAuth(url);
  },

  create: async (eventData: any) => {
    return await fetchWithAuth('/calendar', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  update: async (eventId: number, eventData: any) => {
    return await fetchWithAuth(`/calendar/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  delete: async (eventId: number) => {
    return await fetchWithAuth(`/calendar/${eventId}`, {
      method: 'DELETE'
    });
  }
};

// =============================================
// NOTIFICATIONS API
// =============================================

export const notificationsAPI = {
  getAll: async (unreadOnly = false) => {
    const url = unreadOnly ? '/notifications?unreadOnly=true' : '/notifications';
    return await fetchWithAuth(url);
  },

  markAsRead: async (notificationId: number) => {
    return await fetchWithAuth(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  },

  clearAll: async () => {
    return await fetchWithAuth('/notifications', {
      method: 'DELETE'
    });
  }
};

// =============================================
// TUTORIALS API
// =============================================

export const tutorialsAPI = {
  getAll: async (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `/tutorials?${params}` : '/tutorials';
    return await fetchWithAuth(url);
  },

  getById: async (tutorialId: number) => {
    return await fetchWithAuth(`/tutorials/${tutorialId}`);
  },

  bookmark: async (tutorialId: number) => {
    return await fetchWithAuth('/tutorials/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ tutorialId })
    });
  },

  removeBookmark: async (tutorialId: number) => {
    return await fetchWithAuth(`/tutorials/bookmarks/${tutorialId}`, {
      method: 'DELETE'
    });
  },

  getBookmarks: async () => {
    return await fetchWithAuth('/tutorials/bookmarks/my');
  }
};

// =============================================
// TUTORS API
// =============================================

export const tutorsAPI = {
  getAll: async (subject?: string) => {
    const url = subject && subject !== 'all' ? `/tutors?subject=${encodeURIComponent(subject)}` : '/tutors';
    return await fetchWithAuth(url);
  },

  getById: async (tutorId: string | number) => {
    return await fetchWithAuth(`/tutors/${tutorId}`);
  }
};

// =============================================
// BOOKINGS API
// =============================================

export const bookingsAPI = {
  create: async (bookingData: {
    tutorId: string | number;
    subject?: string;
    date: string;
    time: string;
    duration: string;
    sessionType?: string;
    notes?: string;
  }) => {
    return await fetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData)
    });
  },

  getAll: async () => {
    return await fetchWithAuth('/bookings');
  }
};

// =============================================
// MESSAGES API
// =============================================

export const messagesAPI = {
  getConversations: async () => {
    return await fetchWithAuth('/messages');
  },

  getChat: async (tutorId: number) => {
    return await fetchWithAuth(`/messages/${tutorId}`);
  },

  send: async (tutorId: number, content: string) => {
    return await fetchWithAuth('/messages', {
      method: 'POST',
      body: JSON.stringify({ tutorId, content })
    });
  }
};

// =============================================
// SUBJECTS API
// =============================================

export const subjectsAPI = {
  getAll: async (filters?: { category?: string; search?: string }) => {
    const params = new URLSearchParams(filters as any).toString();
    const url = params ? `/subjects?${params}` : '/subjects';
    return await fetch(`${API_BASE_URL}${url}`).then(r => r.json());
  },

  getCategories: async () => {
    return await fetch(`${API_BASE_URL}/subjects/categories`).then(r => r.json());
  },

  enroll: async (userId: number, subjectIds: number[]) => {
    return await fetchWithAuth('/subjects/enroll', {
      method: 'POST',
      body: JSON.stringify({ userId, subjectIds })
    });
  },

  getEnrolled: async (userId: number) => {
    return await fetchWithAuth(`/subjects/enrolled/${userId}`);
  },

  unenroll: async (userId: number, subjectId: number) => {
    return await fetchWithAuth('/subjects/unenroll', {
      method: 'DELETE',
      body: JSON.stringify({ userId, subjectId })
    });
  }
};

// =============================================
// HELPER FUNCTIONS
// =============================================

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// =============================================
// PACKAGES API
// =============================================

export const packagesAPI = {
  getAll: async () => {
    return await fetchWithAuth('/packages');
  },

  getUserPackage: async () => {
    return await fetchWithAuth('/packages/user');
  },

  upgradePackage: async (packageId: string) => {
    return await fetchWithAuth('/packages/user/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ packageId })
    });
  },

  getLimits: async () => {
    return await fetchWithAuth('/packages/limits');
  }
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('learner_current');
  localStorage.removeItem('learnerData');
};

// =============================================
// SMART APPLY API (standalone – uses smart_apply_candidates, own token)
// =============================================

const SMART_APPLY_TOKEN_KEY = 'smart_apply_token';

const getSmartApplyToken = (): string | null => localStorage.getItem(SMART_APPLY_TOKEN_KEY);

const fetchWithSmartApplyAuth = async (url: string, options: RequestInit = {}) => {
  const token = getSmartApplyToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const path = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${API_BASE_URL}${path}`;
  if (import.meta.env.DEV) {
    console.log('[Smart Apply API]', options.method || 'GET', fullUrl);
  }
  let response: Response;
  try {
    response = await fetch(fullUrl, { ...options, headers });
  } catch (networkErr: unknown) {
    const isFailedFetch = networkErr instanceof Error && networkErr.message === 'Failed to fetch';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown-origin';
    const msg = isFailedFetch
      ? `Cannot reach server at ${fullUrl}. Check that VITE_API_URL is correct and that CORS allows this origin: ${currentOrigin}. If you are using a LAN/dev URL, open the app via http://localhost:8080 (or add your current origin on backend CORS allowlist).`
      : (networkErr instanceof Error ? networkErr.message : 'Network error');
    throw new Error(msg);
  }
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const msg = data.message || data.error || `Server error: ${response.status}`;
    if (response.status === 404) {
      throw new Error(`${msg}. Ensure the app-booker-pro backend is running (cd backend && npm run dev) on port 5000.`);
    }
    throw new Error(msg);
  }
  return response.json();
};

const fetchWithSmartApplyAuthBlob = async (url: string): Promise<Blob> => {
  const token = getSmartApplyToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const path = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${API_BASE_URL}${path}`;
  const response = await fetch(fullUrl, { headers });
  if (!response.ok) throw new Error(response.status === 404 ? 'CV not found' : `Server error: ${response.status}`);
  return response.blob();
};

export const smartApplyAPI = {
  sendEmails: async (payload: {
    emails: { to: string; subject: string; body: string }[];
    userEmail: string;
    userName?: string;
    cvBase64?: string;
    cvFileName?: string;
  }) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem(SMART_APPLY_TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}/smart-apply/send-emails`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Server error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },

  getDashboard: async () => {
    return await fetchWithSmartApplyAuth('/smart-apply/dashboard');
  },

  generateEmails: async (payload: {
    applications: { to: string; topic: string }[];
    userDetails?: { name?: string; surname?: string; fullName?: string; email?: string; contactNumber?: string };
    profile?: { category?: string | null; overview?: string | null; workExperience?: string | null; education?: string | null; certifications?: string | null; keySkills?: string | null };
  }): Promise<{ success: boolean; emails: { to: string; subject: string; body: string }[] }> => {
    return await fetchWithSmartApplyAuth('/smart-apply/generate-emails', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  register: async (payload: { fullName: string; email: string; password: string; phone?: string }) => {
    const res = await fetch(`${API_BASE_URL}/smart-apply/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  confirmEmail: async (token: string) => {
    const res = await fetch(`${API_BASE_URL}/smart-apply/auth/confirm-email?token=${encodeURIComponent(token)}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Confirmation failed');
    return data;
  },

  resendConfirmationEmail: async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/smart-apply/auth/resend-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to resend confirmation link');
    return data;
  },

  markOnboardingTourComplete: async () => {
    return fetchWithSmartApplyAuth('/smart-apply/onboarding-tour-complete', { method: 'POST' });
  },

  login: async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/smart-apply/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'unknown-origin';
      const hint = msg === 'Failed to fetch' || msg.includes('fetch')
        ? ` Make sure VITE_API_URL in .env points to ib-backend (e.g. https://ib-backend.ib-innovativesolutions.com/api/), and ensure backend CORS allows your current origin (${currentOrigin}).`
        : '';
      throw new Error(msg + hint);
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || data.error || 'Invalid email or password');
    if (data.token) localStorage.setItem(SMART_APPLY_TOKEN_KEY, data.token);
    return data;
  },

  googleLogin: async (idToken: string) => {
    const res = await fetch(`${API_BASE_URL}/smart-apply/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Google sign-in failed');
    if (data.token) localStorage.setItem(SMART_APPLY_TOKEN_KEY, data.token);
    return data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    return await fetchWithSmartApplyAuth('/smart-apply/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  deactivateAccount: async (password: string) => {
    return await fetchWithSmartApplyAuth('/smart-apply/auth/deactivate', {
      method: 'PUT',
      body: JSON.stringify({ password })
    });
  },

  getProfile: async () => {
    const data = await fetchWithSmartApplyAuth('/smart-apply/profile');
    return data?.profile ? data : { profile: null };
  },

  saveProfile: async (payload: {
    category: 'general' | 'professional';
    fullName?: string | null;
    phone?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    nationality?: string | null;
    currentLocation?: string | null;
    jobTitle?: string | null;
    linkedinUrl?: string | null;
    website?: string | null;
    primaryCvId?: number | null;
    overview?: string | null;
    profilePicture?: string | null;
    showProfilePictureOnCv?: boolean;
    workExperience?: Record<string, unknown>[] | null;
    education?: Record<string, unknown>[] | null;
    certifications?: Record<string, unknown>[] | null;
    keySkills?: { name: string; level?: string }[] | null;
    addresses?: { label?: string; addressLine1?: string; addressLine2?: string; city?: string; stateRegion?: string; postalCode?: string; country?: string; isPrimary?: boolean }[] | null;
  }) => {
    return await fetchWithSmartApplyAuth('/smart-apply/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  getCandidates: async (category?: 'general' | 'professional') => {
    const q = category ? `?category=${category}` : '';
    const res = await fetch(`${API_BASE_URL}/smart-apply/candidates${q}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Server error: ${res.status}`);
    }
    return res.json();
  },

  listCVs: async () => {
    const data = await fetchWithSmartApplyAuth('/smart-apply/cvs');
    return data?.cvs != null ? data : { cvs: [] };
  },

  getCVBlob: async (id: number, download: boolean) => {
    const q = download ? '?download=true' : '';
    return fetchWithSmartApplyAuthBlob(`/smart-apply/cvs/${id}${q}`);
  },

  uploadCV: async (payload: { label: string; roleOrCategory?: string; fileName: string; fileBase64: string }) => {
    return await fetchWithSmartApplyAuth('/smart-apply/cvs', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  extractCV: async (fileBase64: string): Promise<{ success: boolean; profile: Record<string, unknown> }> => {
    const data = await fetchWithSmartApplyAuth('/smart-apply/extract-cv', {
      method: 'POST',
      body: JSON.stringify({ fileBase64 })
    });
    return data as { success: boolean; profile: Record<string, unknown> };
  },

  deleteCV: async (id: number) => {
    return await fetchWithSmartApplyAuth(`/smart-apply/cvs/${id}`, { method: 'DELETE' });
  },

  createPublicCV: async (cvData: Record<string, unknown>, templateId: number) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return await fetchWithSmartApplyAuth('/smart-apply/public-cv', {
      method: 'POST',
      body: JSON.stringify({ cvData, templateId, baseUrl }),
    });
  },

  getPublicCV: async (slug: string) => {
    const path = `/smart-apply/public-cv/${encodeURIComponent(slug)}`;
    const res = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to load CV: ${res.status}`);
    }
    return res.json();
  },

  recordPublicCvAnalytics: async (slug: string, eventType: 'download' | 'link_click', linkUrl?: string) => {
    const res = await fetch(`${API_BASE_URL}/smart-apply/public-cv/${encodeURIComponent(slug)}/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, linkUrl }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to record');
    }
    return res.json();
  },

  getResumeAnalytics: async () => {
    return await fetchWithSmartApplyAuth('/smart-apply/resume-analytics');
  },

  // Premium / Auto-apply credits
  getCredits: async () => {
    const data = await fetchWithSmartApplyAuth('/smart-apply/premium/credits').catch(() => ({}));
    return { credits: Number(data?.credits) || 0, ...data };
  },

  getPremiumPackages: async () => {
    const data = await fetchWithSmartApplyAuth('/smart-apply/premium/packages').catch(() => ({}));
    const packages = data?.packages ?? [];
    return { packages };
  },

  purchaseCredits: async (packageId: string) => {
    return await fetchWithSmartApplyAuth('/smart-apply/premium/purchase', {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    });
  },

  getAutoApplyMatches: async () => {
    const data = await fetchWithSmartApplyAuth('/smart-apply/premium/matches').catch(() => ({}));
    return { matches: data?.matches ?? [] };
  },

  acceptAutoApplyMatch: async (matchId: string) => {
    return await fetchWithSmartApplyAuth(`/smart-apply/premium/matches/${matchId}/accept`, {
      method: 'POST',
    });
  },

  declineAutoApplyMatch: async (matchId: string) => {
    return await fetchWithSmartApplyAuth(`/smart-apply/premium/matches/${matchId}/decline`, {
      method: 'POST',
    });
  },

  getMyApplications: async () => {
    const data = await fetchWithSmartApplyAuth('/smart-apply/applications').catch(() => ({}));
    return { applications: data?.applications ?? [] };
  },
};

// =============================================
// JOB ASSIST API
// Calls POST /api/job-assist – file upload or plain text.
// Uses VITE_LOCAL_API_URL (local backend) because this route is not yet on production.
// Returns AI-generated CV content structured as CvPreviewData fields.
// =============================================

// Points to local backend when set; falls back to the same base URL as everything else.
const JOB_ASSIST_BASE_URL = (import.meta.env.VITE_LOCAL_API_URL || API_BASE_URL).replace(/\/+$/, '');

export interface JobAssistCvContent {
  jobTitle?: string;
  overview: string;
  keySkills: { name: string; level?: string }[];
  workExperience: {
    jobTitle?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    location?: string;
  }[];
  education: {
    qualification?: string;
    institution?: string;
    startDate?: string;
    endDate?: string;
  }[];
}

export const jobAssistAPI = {
  /**
   * Generate a CV from a job description.
   * @param payload  { file } OR { jobText }, plus optional profileData (existing CV data to tailor)
   */
  generate: async (
    payload: ({ file: File; jobText?: never } | { jobText: string; file?: never }) & {
      profileData?: {
        overview?: string;
        workExperience?: object[];
        education?: object[];
        keySkills?: object[];
      };
    }
  ): Promise<{ success: boolean; cvContent: JobAssistCvContent }> => {
    const token = localStorage.getItem('smart_apply_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let body: FormData | string;
    let contentType: string | undefined;

    if (payload.file) {
      // Multipart upload – append profileData as a JSON string field
      const fd = new FormData();
      fd.append('file', payload.file);
      if (payload.profileData) fd.append('profileData', JSON.stringify(payload.profileData));
      body = fd;
      // Do NOT set Content-Type; browser will do it with boundary
    } else {
      body = JSON.stringify({ jobText: payload.jobText, profileData: payload.profileData });
      contentType = 'application/json';
    }

    if (contentType) headers['Content-Type'] = contentType;

    const doRequest = async (baseUrl: string) => {
      const res = await fetch(`${baseUrl}/job-assist`, {
        method: 'POST',
        headers,
        body,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || `Server error: ${res.status}`);
      }
      return data as { success: boolean; cvContent: JobAssistCvContent };
    };

    try {
      return await doRequest(JOB_ASSIST_BASE_URL);
    } catch (err: unknown) {
      const isNetworkError = err instanceof TypeError || (err instanceof Error && err.message === 'Failed to fetch');

      // If local job-assist backend is unavailable, fall back to the primary API base.
      if (isNetworkError && JOB_ASSIST_BASE_URL !== API_BASE_URL) {
        try {
          return await doRequest(API_BASE_URL);
        } catch {
          // Continue to friendly network error below.
        }
      }

      if (isNetworkError) {
        throw new Error(`Cannot connect to Job Assist service. Checked ${JOB_ASSIST_BASE_URL} and ${API_BASE_URL}.`);
      }

      throw err;
    }
  },
};

