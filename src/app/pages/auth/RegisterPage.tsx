import { AuthLayout } from '@/app/layout/AuthLayout';
import { RegisterForm } from '@/features/auth/register/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout title="Создать аккаунт" subtitle="Присоединяйтесь как заказчик или фрилансер">
      <RegisterForm />
    </AuthLayout>
  );
}
