import React from 'react';
import { Outlet } from 'react-router-dom';
import Paper from '@mui/material/Paper';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-zinc-100 to-zinc-300 dark:from-zinc-900 dark:to-black p-4 transition-colors duration-300">
      <Paper
        elevation={4}
        className="w-full max-w-md p-8 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-zinc-800 shadow-xl"
        sx={{
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          '@media (prefers-color-scheme: dark)': {
            backgroundColor: 'rgba(24, 24, 27, 0.85)',
          }
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 text-white font-bold text-xl mb-3">
            E
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Enterprise Portal
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Access secure services
          </p>
        </div>

        <Outlet />
      </Paper>
    </div>
  );
};

export default AuthLayout;
