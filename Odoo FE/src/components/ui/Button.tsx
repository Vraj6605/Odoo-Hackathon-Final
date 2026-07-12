import React from 'react';
import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';

export interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  variant?: 'text' | 'contained' | 'outlined';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'contained',
  color = 'primary',
  className = '',
  children,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize shadow-sm transition-all hover:shadow-md active:scale-95 ${className}`}
      sx={{
        textTransform: 'none', // Disable default uppercase
        borderRadius: '8px',
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
