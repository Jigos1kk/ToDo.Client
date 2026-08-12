import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { authApi } from '@/entities/user';
import { Button, Input } from '@/shared/ui';

import { emailSchema } from '../model/validation';
import styles from '../confirm-email/TokenForm.module.css';

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  // API всегда отвечает 200, чтобы не раскрывать существование email
  const onSubmit = handleSubmit(async (values) => {
    await authApi.forgotPassword(values.email);
    setSent(true);
  });

  if (sent) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon} aria-hidden>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className={styles.successTitle}>Письмо отправлено</h2>
        <p className={styles.successText}>
          Если указанный email зарегистрирован, на него отправлена инструкция по восстановлению
          пароля.
        </p>
        <Link to="/reset-password" className={styles.successLink}>
          <Button fullWidth>У меня есть токен</Button>
        </Link>
        <p className={styles.footer}>
          <Link to="/login">Вернуться ко входу</Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus
        hint="Мы отправим одноразовый токен для сброса пароля"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Отправить инструкцию
      </Button>
      <p className={styles.footer}>
        <Link to="/login">Вернуться ко входу</Link>
      </p>
    </form>
  );
}
