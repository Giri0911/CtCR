const configuredApiUrl = globalThis.process?.env?.NEXT_PUBLIC_API_URL;
const API_URL = (configuredApiUrl || "http://localhost:5000").replace(/\/$/, "");

async function request(path, options = {}) {
  const token = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("campusxcompany.token") : null;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The server request failed.");
  return body;
}

function storeToken(result) {
  if (result.token && typeof sessionStorage !== "undefined") {
    sessionStorage.setItem("campusxcompany.token", result.token);
    if (result.email) sessionStorage.setItem("campusxcompany.email", result.email);
  }
  return result;
}

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }).then(storeToken),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }).then(storeToken),
  getProfile: (type, email) => request(`/api/profiles/${type}/${encodeURIComponent(email)}`),
  updateProfile: (type, email, payload) =>
    request(`/api/profiles/${type}/${encodeURIComponent(email)}`, { method: "PUT", body: JSON.stringify(payload) }),
  getCollection: (resource) => request(`/api/data/${resource}`),
  saveCollection: (resource, items) =>
    request(`/api/data/${resource}`, { method: "PUT", body: JSON.stringify(items) }),
  getSavedOpportunities: (email) =>
    request(`/api/data/saved-opportunities/${encodeURIComponent(email)}`),
  saveSavedOpportunities: (email, ids) =>
    request(`/api/data/saved-opportunities/${encodeURIComponent(email)}`, {
      method: "PUT",
      body: JSON.stringify(ids)
    }),
  saveNotificationPreferences: (scope, payload) =>
    request(`/api/data/notifications/${encodeURIComponent(scope)}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    })
};
