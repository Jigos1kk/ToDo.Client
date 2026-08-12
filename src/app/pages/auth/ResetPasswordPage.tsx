import { AuthLayout } from '@/app/layout/AuthLayout';
import { ResetPasswordForm } from '@/features/auth/reset-password/ResetPasswordForm';

export function ResetPasswordPage() {
  return (
    <AuthLayout title="Сброс пароля" subtitle="Введите токен из письма и придумайте новый пароль">
      <ResetPasswordForm />
    </AuthLayout>
  );
}
