import React from 'react';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
      mode: 'light',
      label: 'Light',
      icon: <Sun className="w-4 h-4" />,
    },
    {
      mode: 'dark',
      label: 'Dark',
      icon: <Moon className="w-4 h-4" />,
    },
    {
      mode: 'system',
      label: 'System',
      icon: <Monitor className="w-4 h-4" />,
    },
  ];

  return (
    <div 
      className="inline-flex rounded-xl bg-zinc-200/60 dark:bg-zinc-800/40 p-1 border border-zinc-300/30 dark:border-zinc-800 transition-colors"
      role="radiogroup"
      aria-label="App Theme Toggle"
    >
      {options.map(({ mode, label, icon }) => {
        const isActive = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            role="radio"
            aria-checked={isActive}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
              isActive
                ? 'bg-white dark:bg-zinc-950 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/30'
            }`}
          >
            {icon}
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
