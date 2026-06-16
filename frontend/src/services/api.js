import axios from "axios";

const normalizeApiUrl = (url) => url?.replace(/\/+$/, "");

const isBrowser = typeof window !== "undefined";
const isLocalHostname = (hostname) =>
  ["localhost", "127.0.0.1", "::1"].includes(hostname);

const isLocalApiUrl = (url) => {
  try {
    return isLocalHostname(new URL(url).hostname);
  } catch {
    return false;
  }
};

const currentHostIsLocal =
  isBrowser && isLocalHostname(window.location.hostname);

const fallbackBaseUrls = [];

const envApiUrl = normalizeApiUrl(process.env.REACT_APP_API_URL);
if (
  envApiUrl &&
  !(isBrowser && !currentHostIsLocal && isLocalApiUrl(envApiUrl))
) {
  fallbackBaseUrls.push(envApiUrl);
}

if (isBrowser && !currentHostIsLocal) {
  fallbackBaseUrls.push(`${window.location.origin}/api`);
} else {
  fallbackBaseUrls.push("http://localhost:5050/api");
  fallbackBaseUrls.push("http://localhost:5001/api");
}

fallbackBaseUrls.push("/api");

const uniqueBaseUrls = [...new Set(fallbackBaseUrls.map(normalizeApiUrl))];
const [baseURL, ...retryBaseUrls] = uniqueBaseUrls;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      !originalRequest ||
      originalRequest._retryWithFallback ||
      error.code !== "ERR_NETWORK"
    ) {
      return Promise.reject(error);
    }

    originalRequest._retryWithFallback = true;

    for (const fallbackUrl of retryBaseUrls) {
      try {
        return await axios.request({
          ...originalRequest,
          baseURL: fallbackUrl,
        });
      } catch (fallbackError) {
        if (fallbackError.code !== "ERR_NETWORK") {
          return Promise.reject(fallbackError);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
