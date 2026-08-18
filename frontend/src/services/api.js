/**
 * Centralized API Client for SecureVault
 * Handles base URL, auth token header injection, error unwrapping, and multipart file uploads
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  getToken() {
    try {
      const token = localStorage.getItem('sv_auth_token');
      if (!token) return null;
      // Handle json stringified or raw string
      return token.startsWith('"') ? JSON.parse(token) : token;
    } catch {
      return null;
    }
  }

  getHeaders(isFormData = false, customHeaders = {}) {
    const headers = { ...customHeaders };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    const token = this.getToken();
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const isFormData = options.body instanceof FormData;

    const config = {
      ...options,
      headers: this.getHeaders(isFormData, options.headers)
    };

    try {
      const response = await fetch(url, config);

      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        error.code = data.code;
        throw error;
      }

      return data;
    } catch (err) {
      // Intercept expired tokens
      if (err.status === 401 && err.code === 'TOKEN_EXPIRED') {
        localStorage.removeItem('sv_auth_token');
        localStorage.removeItem('sv_user');
        window.dispatchEvent(new Event('sv_auth_expired'));
      }
      throw err;
    }
  }

  get(endpoint, params = {}, headers = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`${endpoint}${queryString}`, { method: 'GET', headers });
  }

  post(endpoint, body = {}, headers = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
      headers
    });
  }

  put(endpoint, body = {}, headers = {}) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
      headers
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

export const api = new ApiClient(BASE_URL);
