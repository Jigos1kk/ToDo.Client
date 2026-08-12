import type { ReactNode } from 'react';

import { Card } from '../Card/Card';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const DefaultIcon = (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 8v13H3V8" />
    <path d="M1 3h22v5H1z" />
    <path d="M10 12h4" />
  </svg>
);

/** Заглушка для пустых списков и отсутствующих данных. */
export function EmptyState({ icon = DefaultIcon, title, description, action }: EmptyStateProps) {
  return (
    <Card className={styles.empty}>
      <div className={styles.icon} aria-hidden>
        {icon}
      </div>
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </Card>
  );
}
