import clsx from 'clsx';
import type { ComponentPropsWithRef } from 'react';

import { Spinner } from '../Spinner/Spinner';
import styles from './Button.module.css';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading || undefined}
      className={clsx(
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        className,
      )}
      {...props}
    >
      {isLoading && <Spinner size="sm" className={styles.spinner} aria-hidden />}
      {children}
    </button>
  );
}
