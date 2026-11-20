// API base URL configuration:
// - If VITE_API_URL is specified, uses that URL (e.g. for split backend/frontend)
// - In local development (npm run dev), defaults to http://localhost:5000
// - In production when served by the Express backend as a single Web Service, defaults to '' (same-origin relative paths)
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');
