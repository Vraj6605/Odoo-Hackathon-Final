export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'manager';
  avatarUrl?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface APIError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}
