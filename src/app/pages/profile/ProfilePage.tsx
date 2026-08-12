import { useUser } from '@/entities/user';
import { ChangePasswordForm } from '@/features/auth/change-password/ChangePasswordForm';
import { Badge, Card, CardHeader, Skeleton, type BadgeTone } from '@/shared/ui';

import styles from './ProfilePage.module.css';

const roleLabels: Record<string, string> = {
  Admin: 'Администратор',
  Customer: 'Заказчик',
  Freelancer: 'Фрилансер',
  User: 'Пользователь',
};

const roleTones: Record<string, BadgeTone> = {
  Admin: 'danger',
  Customer: 'primary',
  Freelancer: 'info',
  User: 'neutral',
};

export function ProfilePage() {
  const user = useUser();

  if (!user) {
    return (
      <div className={styles.grid}>
        <Card padding="lg">
          <Skeleton height={24} width="40%" />
          <Skeleton height={16} className={styles.skeletonLine} />
          <Skeleton height={16} className={styles.skeletonLine} />
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      <Card padding="lg" className="animate-fade-in-up">
        <CardHeader title="Профиль" subtitle="Данные вашего аккаунта" />
        <div className={styles.profile}>
          <div className={styles.avatar} aria-hidden>
            {user.userName.slice(0, 1).toUpperCase()}
          </div>
          <div className={styles.info}>
            <h2 className={styles.name}>{user.userName}</h2>
            <p className={styles.email}>{user.email}</p>
            <div className={styles.roles}>
              {user.roles.map((role) => (
                <Badge key={role} tone={roleTones[role] ?? 'neutral'}>
                  {roleLabels[role] ?? role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <dl className={styles.details}>
          <div className={styles.detailRow}>
            <dt>Email подтверждён</dt>
            <dd>
              {user.emailConfirmed ? (
                <Badge tone="success">Да</Badge>
              ) : (
                <Badge tone="warning">Нет</Badge>
              )}
            </dd>
          </div>
          <div className={styles.detailRow}>
            <dt>ID пользователя</dt>
            <dd className={styles.mono}>{user.id}</dd>
          </div>
        </dl>
      </Card>

      <Card padding="lg" className="animate-fade-in-up">
        <CardHeader title="Безопасность" subtitle="Смена пароля от аккаунта" />
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
