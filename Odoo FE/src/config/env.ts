export const env = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'My Enterprise App',
  ENV: import.meta.env.VITE_ENV || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

// Ensure required environment variables are set in production
if (env.IS_PROD && !import.meta.env.VITE_API_URL) {
  console.warn('Warning: VITE_API_URL environment variable is not defined in production.');
}
