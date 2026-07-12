import React from 'react';
import MuiTextField, { type TextFieldProps } from '@mui/material/TextField';

export type InputProps = TextFieldProps & {
  className?: string;
};

export const Input: React.FC<InputProps> = ({
  variant = 'outlined',
  fullWidth = true,
  className = '',
  ...props
}) => {
  return (
    <MuiTextField
      variant={variant}
      fullWidth={fullWidth}
      className={`bg-white dark:bg-zinc-800 rounded-lg transition-colors ${className}`}
      slotProps={{
        input: {
          style: { borderRadius: '8px' }
        }
      }}
      {...props}
    />
  );
};

export default Input;
