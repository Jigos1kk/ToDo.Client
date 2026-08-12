import { Link } from 'react-router-dom';

import { Button, EmptyState } from '@/shared/ui';

import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <EmptyState
        title="Страница не найдена"
        description="Похоже, такой страницы не существует или она была перемещена."
        action={
          <Link to="/">
            <Button>На главную</Button>
          </Link>
        }
      />
    </div>
  );
}
