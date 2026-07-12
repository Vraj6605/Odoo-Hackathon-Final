import React from 'react';
import MuiSkeleton, { type SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton';

export interface SkeletonProps extends MuiSkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  animation = 'wave',
  className = '',
  ...props
}) => {
  return (
    <MuiSkeleton
      variant={variant}
      animation={animation}
      className={`bg-zinc-200 dark:bg-zinc-700 ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
