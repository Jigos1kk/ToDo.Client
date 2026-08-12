import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { useAuthStore } from '@/entities/user';
import { getApiErrorMessage } from '@/shared/api/httpClient';
import { Button, Input, PasswordInput, useToast } from '@/shared/ui';

import { emailSchema } from '../model/validation';
import styles from './LoginForm.module.css';

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Пароль обязателен.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const user = await login(values);
      showToast({ tone: 'success', title: `С возвращением, ${user.userName}!` });
      const from = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(from, { replace: true });
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Не удалось войти',
        description: getApiErrorMessage(error),
      });
    }
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus
        error={errors.email?.message}
        {...register('email')}
      />
      <PasswordInput
        label="Пароль"
        placeholder="Ваш пароль"
        error={errors.password?.message}
        {...register('password')}
      />
      <div className={styles.links}>
        <Link to="/forgot-password">Забыли пароль?</Link>
      </div>
      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Войти
      </Button>
      <p className={styles.footer}>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </form>
  );
}
