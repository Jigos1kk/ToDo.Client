import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuthStore } from '@/entities/user';
import { Spinner } from '@/shared/ui';

import styles from './guards.module.css';

function FullPageLoader() {
  return (
    <div className={styles.loader}>
      <Spinner size="lg" />
    </div>
  );
}

/** Пускает только авторизованных; остальных — на /login с сохранением цели. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <FullPageLoader />;
  }
  if (status === 'anonymous') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}

/** Пускает только гостей; авторизованных — на главную. */
export function GuestOnly({ children }: { children: ReactNode }) {
  const status = useAuthStore((state) => state.status);

  if (status === 'idle' || status === 'loading') {
    return <FullPageLoader />;
  }
  if (status === 'authenticated') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
