import { AuthLayout } from '@/app/layout/AuthLayout';
import { ConfirmEmailForm } from '@/features/auth/confirm-email/ConfirmEmailForm';

export function ConfirmEmailPage() {
  return (
    <AuthLayout
      title="Подтверждение email"
      subtitle="Введите токен из письма, которое мы вам отправили"
    >
      <ConfirmEmailForm />
    </AuthLayout>
  );
}
