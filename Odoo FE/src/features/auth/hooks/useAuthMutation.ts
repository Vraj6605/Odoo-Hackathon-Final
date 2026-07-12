import { useMutation } from '@tanstack/react-query';
import { useGlobalStore } from '@/store/globalStore';
import { authApi } from '../services/authApi';

export function useAuthMutation() {
  const setAuth = useGlobalStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await authApi.login(email, password);
      return response;
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        setAuth(response.data.user, response.data.token);
      }
    },
  });
}
