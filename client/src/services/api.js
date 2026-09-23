const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('campusnoa_access_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('campusnoa_access_token', token);
  } else {
    localStorage.removeItem('campusnoa_access_token');
  }
}

async function request(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = (typeof data === 'object' && data.error) ? data.error : (typeof data === 'string' ? data : res.statusText);
    const err = new Error(errorMsg || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const token = res.accessToken || res.token || res.auth0Token;
    if (token) {
      setAuthToken(token);
    }
    return res;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (_) {}
    setAuthToken(null);
  },

  async getSession() {
    return request('/auth/session');
  },

  async switchRole(targetRole) {
    const res = await request('/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role: targetRole }),
    });
    const token = res.accessToken || res.token || res.auth0Token;
    if (token) {
      setAuthToken(token);
    }
    return res;
  },

  async toggleSchoolMode(mode) {
    return request('/auth/school-mode', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  },

  // Students
  async getStudents(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/students${qs ? `?${qs}` : ''}`);
  },

  async getStudentById(id) {
    return request(`/students/${id}`);
  },

  async admitStudent(data) {
    return request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async approveStudent(id) {
    return request(`/students/${id}/approve`, {
      method: 'POST',
    });
  },

  // Faculty / Staff
  async getFaculty(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/faculty${qs ? `?${qs}` : ''}`);
  },

  async getFacultyById(id) {
    return request(`/faculty/${id}`);
  },

  async hireFaculty(data) {
    return request('/faculty', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Class Teacher / Homeroom & Attendance
  async getHomeroomStudents() {
    return request('/attendance/homeroom');
  },

  async submitHomeroomAttendance(records) {
    return request('/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  },

  async getHomeroomFees() {
    return request('/fees/homeroom');
  },

  // GFM / Mentorship
  async getGfmNotes(studentId) {
    return request(`/gfm/notes${studentId ? `?studentId=${studentId}` : ''}`);
  },

  async createGfmNote(data) {
    return request('/gfm/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Finance
  async getFinanceSummary() {
    return request('/finance/summary');
  },

  async getTransactions(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/finance/transactions${qs ? `?${qs}` : ''}`);
  },

  async reconcilePayment(txId) {
    return request(`/finance/transactions/${txId}/reconcile`, {
      method: 'POST',
    });
  },

  async createFeeReceipt(data) {
    return request('/finance/receipt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Counselling
  async getCounsellingCases() {
    return request('/counselling/cases');
  },

  async createCounsellingCase(data) {
    return request('/counselling/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async resolveCounsellingCase(id, resolutionNote) {
    return request(`/counselling/cases/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolutionNote }),
    });
  },

  // Telemetry & Stats
  async getDashboardStats() {
    return request('/dashboard/stats');
  },

  async getBusTelemetry() {
    return request('/bus/telemetry');
  },

  // Logistics & Governance
  async assignProxy(data) {
    return request('/faculty/proxy-assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getSyllabusAudit() {
    return request('/hod/syllabus-audit');
  },

  async broadcastAnnouncement(data) {
    return request('/announcement', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getStudentWard() {
    return request('/students/ward');
  },

  async getAnnouncements() {
    return request('/announcements');
  },

  // Real-time Server Sent Events
  subscribeSSE(onMessage, onError) {
    const token = getAuthToken();
    const eventSource = new EventSource(`/api/events/stream?token=${encodeURIComponent(token)}`);
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch (e) {
        console.error('SSE JSON parse error:', e);
      }
    };
    eventSource.onerror = (err) => {
      if (onError) onError(err);
    };
    return () => eventSource.close();
  }
};
