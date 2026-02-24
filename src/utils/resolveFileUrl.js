/**
 * Resolves a file URL to point to the correct backend server.
 * 
 * File URLs stored in the DB are relative (e.g., "/api/uploads/filename.png").
 * In production, the frontend is on Netlify and the backend on Render,
 * so we need to convert relative URLs to absolute ones pointing at the backend.
 */
const API_URL = import.meta.env.VITE_API_URL || '/api';

export function resolveFileUrl(url) {
    if (!url) return '';

    // Already an absolute URL (http:// or https://) — return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If API_URL is absolute (production), we need to build the full URL
    // API_URL is like "https://skillswap-kfx1.onrender.com/api"
    // fileUrl is like "/api/uploads/filename.png"
    if (API_URL.startsWith('http')) {
        // Extract the base origin from API_URL
        // e.g., "https://skillswap-kfx1.onrender.com/api" -> "https://skillswap-kfx1.onrender.com"
        try {
            const apiOrigin = new URL(API_URL).origin;
            return `${apiOrigin}${url}`;
        } catch {
            return url;
        }
    }

    // In development (API_URL = "/api"), relative URLs work fine with Vite proxy
    return url;
}
