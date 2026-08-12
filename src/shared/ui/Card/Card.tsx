import clsx from 'clsx';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import styles from './Card.module.css';

interface CardProps extends ComponentPropsWithRef<'div'> {
  children: ReactNode;
  padding?: 'none' | 'md' | 'lg';
  interactive?: boolean;
}

export function Card({ children, padding = 'md', interactive, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        styles[`padding-${padding}`],
        interactive && styles.interactive,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
