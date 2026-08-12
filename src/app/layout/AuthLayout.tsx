import type { ReactNode } from 'react';

import { Card } from '@/shared/ui';

import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Центрированная карточка для страниц входа, регистрации и восстановления. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <svg width="40" height="40" viewBox="0 0 32 32" aria-hidden>
            <rect width="32" height="32" rx="8" fill="var(--color-primary-500)" />
            <path
              d="M9 16.5l5 5 9-11"
              stroke="white"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.brandName}>ToDo</span>
        </div>
        <Card padding="lg" className={styles.card}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          <div className={styles.body}>{children}</div>
        </Card>
      </div>
    </div>
  );
}
