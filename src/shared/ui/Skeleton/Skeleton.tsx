import clsx from 'clsx';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  className?: string;
}

/** Блок-заглушка с shimmer-анимацией для состояний загрузки. */
export function Skeleton({ width = '100%', height = 16, circle, className }: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };
  return (
    <span
      aria-hidden
      className={clsx(styles.skeleton, circle && styles.circle, className)}
      style={style}
    />
  );
}
