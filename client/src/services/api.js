const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('campusnoa_access_token') || '';
}

export function getRefreshToken() {
  return localStorage.getItem('campusnoa_refresh_token') || '';
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) {
    localStorage.setItem('campusnoa_access_token', accessToken);
  } else if (accessToken === null) {
    localStorage.removeItem('campusnoa_access_token');
  }

  if (refreshToken) {
    localStorage.setItem('campusnoa_refresh_token', refreshToken);
  } else if (refreshToken === null) {
    localStorage.removeItem('campusnoa_refresh_token');
  }
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('campusnoa_access_token', token);
  } else {
    localStorage.removeItem('campusnoa_access_token');
    localStorage.removeItem('campusnoa_refresh_token');
  }
}

// Concurrency-safe silent refresh handler
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

function onRefreshFailed(err) {
  refreshSubscribers.forEach(cb => cb(null, err));
  refreshSubscribers = [];
}

async function performSilentRefresh() {
  const currentRefreshToken = getRefreshToken();
  const res = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ refreshToken: currentRefreshToken }),
  });

  const contentType = res.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok || (typeof data === 'object' && !data.success)) {
    const errorMsg = (typeof data === 'object' && data.error) ? data.error : 'Token refresh failed';
    throw new Error(errorMsg);
  }

  const newAccessToken = data.accessToken || data.token || data.auth0Token;
  const newRefreshToken = data.refreshToken;
  setTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  return { ...data, newAccessToken };
}

async function request(url, options = {}, isRetry = false) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
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
    
    // Check if error is due to expired access token and we can refresh
    const isTokenExpired = res.status === 401 && (errorMsg === 'TOKEN_EXPIRED' || (typeof data === 'object' && data.error === 'TOKEN_EXPIRED'));
    const isAuthRoute = url.startsWith('/auth/login') || url.startsWith('/auth/refresh-token') || url.startsWith('/auth/logout');

    if (isTokenExpired && !isRetry && !isAuthRoute && (getRefreshToken() || document.cookie.includes('campusnoa_refresh_token'))) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshResult = await performSilentRefresh();
          isRefreshing = false;
          onRefreshed(refreshResult.newAccessToken);
          return request(url, options, true);
        } catch (refreshErr) {
          isRefreshing = false;
          onRefreshFailed(refreshErr);
          setAuthToken(null);
          const err = new Error(refreshErr.message || 'SESSION_EXPIRED');
          err.status = 401;
          throw err;
        }
      } else {
        // Wait for existing refresh in flight
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken, refreshErr) => {
            if (refreshErr || !newToken) {
              const err = new Error('SESSION_EXPIRED');
              err.status = 401;
              return reject(err);
            }
            resolve(request(url, options, true));
          });
        });
      }
    }

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
    const accessToken = res.accessToken || res.token || res.auth0Token;
    const refreshToken = res.refreshToken;
    setTokens({ accessToken, refreshToken });
    return res;
  },

  async refreshToken() {
    return performSilentRefresh();
  },

  async logout() {
    try {
      const refreshToken = getRefreshToken();
      await request('/auth/logout', { 
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      });
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

  async deleteStudent(id) {
    return request(`/students/${id}`, {
      method: 'DELETE',
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

  async assignProxy(data) {
    return request('/faculty/proxy-assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async assignTeacher(data) {
    return request('/assign-teacher', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async assignClassTeacher(data) {
    return request('/assign-teacher', {
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
