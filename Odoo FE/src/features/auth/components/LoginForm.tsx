import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthMutation } from '../hooks/useAuthMutation';
import { validators } from '@/utils/validators';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Toast from '@/components/feedback/Toast';
import Spinner from '@/components/feedback/Spinner';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const loginMutation = useAuthMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setEmailError('');
    setPasswordError('');

    let isValid = true;

    if (!validators.isRequired(email)) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validators.isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!validators.isRequired(password)) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!isValid) return;

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (res) => {
          if (res.success) {
            setToastMsg('Logged in successfully!');
            setToastSeverity('success');
            setToastOpen(true);
            setTimeout(() => {
              navigate(ROUTES.DASHBOARD);
            }, 1000);
          } else {
            setToastMsg(res.message || 'Login failed.');
            setToastSeverity('error');
            setToastOpen(true);
          }
        },
        onError: (err: any) => {
          setToastMsg(err.message || 'Network error occurred. Try again.');
          setToastSeverity('error');
          setToastOpen(true);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <div>
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!emailError}
          helperText={emailError}
          disabled={loginMutation.isPending}
          autoComplete="email"
          autoFocus
        />
      </div>
      
      <div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!passwordError}
          helperText={passwordError}
          disabled={loginMutation.isPending}
          autoComplete="current-password"
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          fullWidth
          disabled={loginMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12"
        >
          {loginMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <Spinner size={20} color="inherit" className="p-0" />
              <span>Signing In...</span>
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
      </div>

      <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 mt-4">
        <span>Use any email &amp; password (&gt;= 6 chars) for demo mode.</span>
      </div>

      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message={toastMsg}
        severity={toastSeverity}
      />
    </form>
  );
};

export default LoginForm;
