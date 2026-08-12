import clsx from 'clsx';

import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-hidden'?: boolean;
}

export function Spinner({ size = 'md', className, 'aria-hidden': ariaHidden }: SpinnerProps) {
  return (
    <span
      role={ariaHidden ? undefined : 'status'}
      aria-label={ariaHidden ? undefined : 'Загрузка'}
      aria-hidden={ariaHidden}
      className={clsx(styles.spinner, styles[size], className)}
    />
  );
}
