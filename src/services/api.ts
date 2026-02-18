// API Service for Backend Communication

// Normalize base URL so we don't end up with double slashes
const RAW_API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
  register: async (userData: { fullName: string; email: string; password: string; grade?: string }) => {
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
// SMART APPLY API (uses same nodemailer as contact)
// =============================================

export const smartApplyAPI = {
  sendEmails: async (payload: {
    emails: { to: string; subject: string; body: string }[];
    userEmail: string;
    userName?: string;
    cvBase64?: string;
    cvFileName?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}smart-apply/send-emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Server error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }
};

