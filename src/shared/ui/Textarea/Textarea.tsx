import clsx from 'clsx';
import { useId, type ComponentPropsWithRef } from 'react';

import styles from './Textarea.module.css';

export interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className, ref, ...props }: TextareaProps) {
  const autoId = useId();
  const textareaId = id ?? autoId;

  return (
    <div className={clsx(styles.field, className)}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        aria-invalid={error ? true : undefined}
        className={clsx(styles.textarea, error && styles.invalid)}
        {...props}
      />
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
