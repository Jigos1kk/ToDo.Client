import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { projectApi } from '@/entities/project/api/projectApi';
import { useAuthStore, useUser } from '@/entities/user';
import { Button } from '@/shared/ui';

import styles from './AppLayout.module.css';

const FolderIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const LogoutIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/** Каркас авторизованной части: сайдбар + шапка + контент. */
export function AppLayout() {
  const user = useUser();
  const logout = useAuthStore((state) => state.logout);
  const hasRole = useAuthStore((state) => state.hasRole);
  const navigate = useNavigate();

  const canCreateProject = hasRole('Customer') || hasRole('Admin');

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.getAll,
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const userInitial = user?.userName?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className={styles.layout}>
      {/* Сайдбар */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <NavLink to="/" className={styles.logo} aria-label="ToDo — на главную">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
              <rect width="32" height="32" rx="8" fill="var(--color-primary-500)" />
              <path
                d="M9 16.5l5 5 9-11"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className={styles.logoText}>ToDo</span>
          </NavLink>

          <nav className={styles.nav} aria-label="Проекты">
            <div className={styles.navLabel}>Проекты</div>
            {projects?.map((project) => (
              <NavLink
                key={project.id}
                to={`/projects/${project.id}`}
                className={({ isActive }) =>
                  isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
                }
              >
                <span className={styles.navItemIcon}>{FolderIcon}</span>
                <span className={styles.navItemText}>{project.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{userInitial}</div>
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user?.userName}</span>
              <span className={styles.userEmail}>{user?.email}</span>
            </div>
          </div>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
            aria-label="Выйти"
            title="Выйти"
          >
            {LogoutIcon}
          </button>
        </div>
      </aside>

      {/* Основная область */}
      <div className={styles.mainArea}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.headerTitle}>Проекты</h1>
          </div>
          <div className={styles.headerActions}>
            {canCreateProject && (
              <Button size="sm" onClick={() => navigate('/')}>
                Создать проект
              </Button>
            )}
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}