import { AuthLayout } from '@/app/layout/AuthLayout';
import { LoginForm } from '@/features/auth/login/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout title="С возвращением" subtitle="Войдите, чтобы продолжить работу с задачами">
      <LoginForm />
    </AuthLayout>
  );
}
