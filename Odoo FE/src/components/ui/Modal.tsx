import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footerActions,
  maxWidth = 'sm',
  fullWidth = true,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slotProps={{
        paper: {
          className: 'rounded-xl p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl',
          style: { borderRadius: '12px' }
        }
      }}
    >
      <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-3">
        {title}
      </DialogTitle>
      
      <DialogContent className="py-4 text-zinc-700 dark:text-zinc-300">
        {children}
      </DialogContent>
      
      {footerActions && (
        <DialogActions className="border-t border-zinc-100 dark:border-zinc-800 pt-3 px-6 gap-2">
          {footerActions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;
