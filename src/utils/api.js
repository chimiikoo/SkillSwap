export function getApiBaseUrl() {
    const configured = import.meta.env.VITE_API_URL?.trim();

    if (!configured) {
        return '/api';
    }

    const normalized = configured.replace(/\/+$/, '');

    if (/^https?:\/\//i.test(normalized)) {
        try {
            const url = new URL(normalized);
            if (url.pathname === '/' || url.pathname === '') {
                url.pathname = '/api';
            } else if (!/\/api$/i.test(url.pathname)) {
                url.pathname = `${url.pathname.replace(/\/+$/, '')}/api`;
            }
            return url.toString().replace(/\/$/, '');
        } catch {
            return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
        }
    }

    return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
}

export function buildApiUrl(path = '') {
    const base = getApiBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
}
