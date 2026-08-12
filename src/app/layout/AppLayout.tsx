import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuthStore, useUser } from '@/entities/user';
import { ThemeToggle } from '@/features/theme/ThemeToggle';
import { Button } from '@/shared/ui';

import styles from './AppLayout.module.css';

const Logo = (
  <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
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
);

/** Каркас авторизованной части: шапка с навигацией + контент. */
export function AppLayout() {
  const user = useUser();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to="/" className={styles.brand} aria-label="ToDo — на главную">
            {Logo}
            <span className={styles.brandName}>ToDo</span>
          </NavLink>

          <nav className={styles.nav} aria-label="Основная навигация">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              Задачи
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              Профиль
            </NavLink>
          </nav>

          <div className={styles.actions}>
            <ThemeToggle />
            {user && (
              <span className={styles.userName} title={user.email}>
                {user.userName}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
