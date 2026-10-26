const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
  : '/api';

/**
 * Helper to build headers with optional authentication token.
 */
function getHeaders(contentType = 'application/json') {
  const headers = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  const token = typeof localStorage !== 'undefined'
    ? localStorage.getItem('admin_token')
    : null;
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
  async bookTour(formData) {
    const res = await fetch(`${API_BASE}/reservations/tour`, {
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

  // ── Calculator ─────────────────────────────────────────────────────────────
  async fetchCalculatorConfig() {
    const res = await fetch(`${API_BASE}/calculator/config`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async submitCalculatorLead(formData) {
    const res = await fetch(`${API_BASE}/calculator/leads`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(formData),
    });
    return handleResponse(res);
  },

  async fetchAdminCalculatorConfig() {
    const res = await fetch(`${API_BASE}/admin/calculator/config`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateCalculatorConfig(configData) {
    const res = await fetch(`${API_BASE}/admin/calculator/config`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(configData),
    });
    return handleResponse(res);
  },

  async fetchCalculatorLeads() {
    const res = await fetch(`${API_BASE}/admin/calculator/leads`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async fetchSpinWheelLeads(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.offerId) query.set('offerId', params.offerId);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/admin/spin-wheel/leads${queryString}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateSpinWheelLead(id, data) {
    const res = await fetch(`${API_BASE}/admin/spin-wheel/leads/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async downloadSpinWheelLeadsExcel(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.offerId) query.set('offerId', params.offerId);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/admin/spin-wheel/leads/export${queryString}`, {
      method: 'GET',
      headers: getHeaders(null),
    });
    if (!res.ok) {
      throw new Error(`Failed to export: ${res.statusText}`);
    }
    return res.blob();
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
    const res = await fetch(`${API_BASE}/content/published`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store'
    });
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

  // ── Plans & Pricing ────────────────────────────────────────────────────────
  async fetchPlans() {
    const res = await fetch(`${API_BASE}/plans`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  async fetchAdminPlans() {
    const res = await fetch(`${API_BASE}/admin/plans`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  async createPlan(planData) {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(planData),
    });
    return handleResponse(res);
  },

  async updatePlan(id, planData) {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(planData),
    });
    return handleResponse(res);
  },

  async deletePlan(id) {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Events (Public) ────────────────────────────────────────────────────────
  async fetchEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.timeframe) query.set('timeframe', params.timeframe);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/events${qs}`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  async fetchEventBySlug(slug) {
    const res = await fetch(`${API_BASE}/events/slug/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Events (Admin) ─────────────────────────────────────────────────────────
  async fetchAdminEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.category) query.set('category', params.category);
    if (params.timeframe) query.set('timeframe', params.timeframe);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/events/admin/all${qs}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async fetchAdminEventById(id) {
    const res = await fetch(`${API_BASE}/events/admin/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createEvent(eventData) {
    const res = await fetch(`${API_BASE}/events/admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(res);
  },

  async updateEvent(id, eventData) {
    const res = await fetch(`${API_BASE}/events/admin/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
    });
    return handleResponse(res);
  },

  async togglePublishEvent(id, status) {
    const res = await fetch(`${API_BASE}/events/admin/${id}/publish`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async deleteEvent(id) {
    const res = await fetch(`${API_BASE}/events/admin/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Blog (Public) ──────────────────────────────────────────────────────────
  async fetchBlogPosts(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/blog/posts${qs}`, { method: 'GET', headers: getHeaders() });
    return handleResponse(res);
  },

  async fetchBlogPostBySlug(slug) {
    const res = await fetch(`${API_BASE}/blog/posts/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async fetchBlogCategories() {
    const res = await fetch(`${API_BASE}/blog/categories`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // ── Blog (Admin) ───────────────────────────────────────────────────────────
  async fetchAdminBlogPosts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category) query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    if (params.sort) query.set('sort', params.sort);
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`${API_BASE}/blog/admin/posts${qs}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async fetchAdminBlogPostById(id) {
    const res = await fetch(`${API_BASE}/blog/admin/posts/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createBlogPost(postData) {
    const res = await fetch(`${API_BASE}/blog/admin/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postData),
    });
    return handleResponse(res);
  },

  async updateBlogPost(id, postData) {
    const res = await fetch(`${API_BASE}/blog/admin/posts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(postData),
    });
    return handleResponse(res);
  },

  async togglePublishBlogPost(id, status) {
    const res = await fetch(`${API_BASE}/blog/admin/posts/${id}/publish`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async deleteBlogPost(id) {
    const res = await fetch(`${API_BASE}/blog/admin/posts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async saveBlogCategory(catData) {
    const res = await fetch(`${API_BASE}/blog/admin/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(catData),
    });
    return handleResponse(res);
  },

  async deleteBlogCategory(id) {
    const res = await fetch(`${API_BASE}/blog/admin/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
