/** Mock fallbacks only in local dev when API fails */
export const ALLOW_MOCKS = import.meta.env.DEV && import.meta.env.VITE_ALLOW_MOCKS !== 'false';
