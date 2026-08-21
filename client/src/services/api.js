const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Helper to build headers with optional authentication token.
 */
function getHeaders(contentType = 'application/json') {
  const headers = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = localStorage.getItem('admin_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Handle API responses consistently.
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.message || response.statusText || 'An error occurred';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // ── Seats ──────────────────────────────────────────────────────────────────
  async fetchSeats() {
    const res = await fetch(`${API_BASE}/seats`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  // ── Reservations ───────────────────────────────────────────────────────────
  async submitReservation(formData) {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });
    return handleResponse(res);
  },

  async submitFreeTrial(formData) {
    const res = await fetch(`${API_BASE}/reservations/free-trial`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });
    return handleResponse(res);
  },

  async submitWhatsAppLead(formData) {
    const res = await fetch(`${API_BASE}/reservations/whatsapp-lead`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });
    return handleResponse(res);
  },

  async confirmReservation(confirmData) {
    const res = await fetch(`${API_BASE}/reservations/confirm`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(confirmData),
    });
    return handleResponse(res);
  },

  async failReservation(reservationId) {
    const res = await fetch(`${API_BASE}/reservations/fail`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reservationId }),
    });
    return handleResponse(res);
  },

  // ── Auth ───────────────────────────────────────────────────────────────────
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse(res);
    if (data && data.token) {
      localStorage.setItem('admin_token', data.token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  logout() {
    localStorage.removeItem('admin_token');
  },

  // ── Admin: Reservations ────────────────────────────────────────────────────
  async getReservations() {
    const res = await fetch(`${API_BASE}/reservations`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  async updateReservation(id, data) {
    const res = await fetch(`${API_BASE}/reservations/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },



  async updateSeatStatus(zone, label, status) {
    const res = await fetch(`${API_BASE}/reservations/seats/status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ zone, label, status }),
    });
    return handleResponse(res);
  },

  // ── Admin: Capacity & Seats ────────────────────────────────────────────────
  async getCapacity() {
    const res = await fetch(`${API_BASE}/admin/capacity`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  async updateCapacity(data) {
    const res = await fetch(`${API_BASE}/admin/capacity`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getAmountSettings() {
    const res = await fetch(`${API_BASE}/admin/settings/amount`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  async updateAmountSettings(amount) {
    const res = await fetch(`${API_BASE}/admin/settings/amount`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse(res);
  },

  async createManualBooking(data) {
    const res = await fetch(`${API_BASE}/admin/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async manageSeatState(id, action, reason = '') {
    const res = await fetch(`${API_BASE}/admin/seats/${id}/${action}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  // ── CMS Content ────────────────────────────────────────────────────────────
  async fetchPublishedContent() {
    const res = await fetch(`${API_BASE}/content/published`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  async fetchDraftContent() {
    const res = await fetch(`${API_BASE}/content/draft`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  async saveDraftContent(content) {
    const res = await fetch(`${API_BASE}/content/draft`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(content),
    });
    return handleResponse(res);
  },

  async publishContent() {
    const res = await fetch(`${API_BASE}/content/publish`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Media / File Upload ────────────────────────────────────────────────────
  /**
   * Upload file using base64 string payload.
   * Returns { success, url, fileName, mimeType, sizeBytes, isVideo, isImage, altText }
   */
  async uploadFile(fileName, fileType, fileData, altText = '') {
    const res = await fetch(`${API_BASE}/content/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileName, fileType, fileData, altText }),
    });
    return handleResponse(res);
  },

  /**
   * Fetch all media assets from the media library.
   * Returns { success, data: Array<MediaItem>, count }
   */
  async fetchMediaLibrary() {
    const res = await fetch(`${API_BASE}/content/media`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  /**
   * Update alt text / description for an existing media file.
   */
  async updateMediaMeta(fileName, { altText, description }) {
    const res = await fetch(`${API_BASE}/content/media/${encodeURIComponent(fileName)}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ altText, description }),
    });
    return handleResponse(res);
  },

  /**
   * Delete a media file from the library.
   */
  async deleteMedia(fileName) {
    const res = await fetch(`${API_BASE}/content/media/${encodeURIComponent(fileName)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
