import type { User } from '@/types/common';

export interface LoginResponseData {
  user: User;
  token: string;
}

export interface AuthError {
  message: string;
  field?: string;
}
