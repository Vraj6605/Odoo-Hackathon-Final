export const authHelpers = {
  storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },
  
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },
  
  clearToken(): void {
    localStorage.removeItem('auth_token');
  },
};
