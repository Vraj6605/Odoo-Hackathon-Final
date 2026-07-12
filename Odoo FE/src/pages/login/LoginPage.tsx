import React from 'react';
import LoginForm from '@/features/auth/components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
          Welcome Back
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Please log in to your account to continue
        </p>
      </div>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
