import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

export interface SpinnerProps {
  size?: number | string;
  className?: string;
  color?: 'primary' | 'secondary' | 'inherit' | 'success' | 'warning' | 'info' | 'error';
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 40,
  className = '',
  color = 'primary',
}) => {
  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <CircularProgress size={size} color={color} />
    </div>
  );
};

export default Spinner;
