import clsx from 'clsx';
import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';

import styles from './Select.module.css';

export interface SelectProps extends ComponentPropsWithRef<'select'> {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Select({
  label,
  error,
  hint,
  id,
  className,
  children,
  ref,
  ...props
}: SelectProps) {
  const autoId = useId();
  const selectId = id ?? autoId;

  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={clsx(styles.control, error && styles.invalid)}>
        <select
          id={selectId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          className={styles.select}
          {...props}
        >
          {children}
        </select>
        <svg
          className={styles.chevron}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : (
        hint && <p className={styles.hint}>{hint}</p>
      )}
    </div>
  );
}
