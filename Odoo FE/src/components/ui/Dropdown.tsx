import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface DropdownProps {
  label: string;
  value: string | number;
  onChange: (event: SelectChangeEvent<any>) => void;
  options: DropdownOption[];
  error?: boolean;
  helperText?: string;
  className?: string;
  fullWidth?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  onChange,
  options,
  error = false,
  helperText = '',
  className = '',
  fullWidth = true,
}) => {
  const labelId = `dropdown-label-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <FormControl fullWidth={fullWidth} error={error} className={className}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={value}
        label={label}
        onChange={onChange}
        sx={{
          borderRadius: '8px',
          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#ffffff' : '#27272a',
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Dropdown;
