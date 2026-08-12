import { AuthLayout } from '@/app/layout/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/forgot-password/ForgotPasswordForm';

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Восстановление пароля"
      subtitle="Укажите email, с которым вы регистрировались"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
