import clsx from 'clsx';
import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';

import styles from './Input.module.css';

export interface InputProps extends ComponentPropsWithRef<'input'> {
  label?: string;
  error?: string;
  hint?: string;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  leadingIcon,
  trailing,
  id,
  className,
  ref,
  ...props
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div
        className={clsx(styles.control, error && styles.invalid, props.disabled && styles.disabled)}
      >
        {leadingIcon && (
          <span className={styles.leadingIcon} aria-hidden>
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={styles.input}
          {...props}
        />
        {trailing && <span className={styles.trailing}>{trailing}</span>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} role="alert" className={styles.error}>
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
