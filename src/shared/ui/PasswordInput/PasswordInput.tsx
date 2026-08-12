import { useState } from 'react';

import { Input, type InputProps } from '../Input/Input';
import styles from './PasswordInput.module.css';

const EyeIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.6 10.6 0 0 1 12 19c-6.5 0-10-7-10-7a17.6 17.6 0 0 1 4.06-4.94" />
    <path d="M9.9 4.24A10.3 10.3 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-2.16 3.19" />
    <path d="M14.12 14.12A3 3 0 1 1 9.88 9.88" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export function PasswordInput({ autoComplete = 'current-password', ...props }: InputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      trailing={
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          aria-pressed={visible}
        >
          {visible ? EyeOffIcon : EyeIcon}
        </button>
      }
      {...props}
    />
  );
}
