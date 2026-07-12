export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  VEHICLES: '/dashboard/vehicles',
  TRIPS: '/dashboard/trips',
  MAINTENANCE: '/dashboard/maintenance',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];
