
export const COOKIE_OPTIONS = {
    secure: import.meta.env.VITE_COOKIE_SECURE === 'true', 
    sameSite: (import.meta.env.VITE_COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',  
    expires: parseInt(import.meta.env.VITE_JWT_EXPIRY_DAYS || '7'),        
};


export const COOKIE_REMOVE_OPTIONS = {
    path: '/'
};


export const COOKIE_NAMES = {
    JWT_TOKEN: 'jwt_token',
    AUTH_USER: 'auth-user'
} as const; 