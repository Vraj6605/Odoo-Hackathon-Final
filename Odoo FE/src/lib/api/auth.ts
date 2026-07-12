import apiClient from './apiClient';

export interface SignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role_id?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  fcm_token?: string | null;
}

export interface VerifyOtpPayload {
  otp: number;
  user_id: string;
}

export interface ResetPasswordPayload {
  old_password: string;
  new_password: string;
}

export interface ValidatePasswordPayload {
  token: string;
  new_password: string;
}

export const authApi = {
  // Register a new user
  async signup(payload: SignupPayload) {
    const response = await apiClient.post('/api/v1/users/signup', payload);
    return response.data;
  },

  // Login with email and password
  async login(payload: LoginPayload) {
    const response = await apiClient.post('/api/v1/users/user-login', {
      ...payload,
      fcm_token: payload.fcm_token || null,
    });
    return response.data;
  },

  // Verify user OTP
  async verifyOtp(payload: VerifyOtpPayload) {
    const response = await apiClient.post('/api/v1/users/verify-otp', payload);
    return response.data;
  },

  // Reset password (authenticated)
  async resetPassword(payload: ResetPasswordPayload) {
    const response = await apiClient.post('/api/v1/users/reset-password', payload);
    return response.data;
  },

  // Request forgot password reset link
  async forgotPassword(email: string) {
    const response = await apiClient.post('/api/v1/users/forgot-password', { email });
    return response.data;
  },

  // Validate password reset and update password
  async validatePassword(payload: ValidatePasswordPayload) {
    const response = await apiClient.post('/api/v1/users/validate-password', payload);
    return response.data;
  },

  // Get Access Token from Refresh Token
  async refreshToken(token: string) {
    const response = await apiClient.get('/api/v1/users/refresh-token', {
      params: { token },
    });
    return response.data;
  },

  // Get current logged-in user profile
  async getCurrentUser() {
    const response = await apiClient.get('/api/v1/users/me');
    return response.data;
  },
};
