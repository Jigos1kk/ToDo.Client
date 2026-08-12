import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { authApi } from '@/entities/user';
import { getApiErrorMessage } from '@/shared/api/httpClient';
import { Button, Input, PasswordInput } from '@/shared/ui';

import { passwordSchema } from '../model/validation';
import styles from '../confirm-email/TokenForm.module.css';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Введите токен из письма.'),
    newPassword: passwordSchema,
    passwordConfirm: z.string().min(1, 'Подтвердите пароль.'),
  })
  .refine((values) => values.newPassword === values.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Пароли не совпадают.',
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [done, setDone] = useState(false);
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    // Токен можно передать в ссылке: /reset-password?token=...
    defaultValues: { token: searchParams.get('token') ?? '', newPassword: '', passwordConfirm: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.resetPassword(values.token.trim(), values.newPassword);
      setDone(true);
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error, 'Не удалось сбросить пароль.') });
    }
  });

  if (done) {
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
        <h2 className={styles.successTitle}>Пароль изменён</h2>
        <p className={styles.successText}>Теперь можно войти с новым паролем.</p>
        <Link to="/login" className={styles.successLink}>
          <Button fullWidth>Войти</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <Input
        label="Токен из письма"
        placeholder="Вставьте токен"
        autoFocus
        error={errors.token?.message}
        {...register('token')}
      />
      <PasswordInput
        label="Новый пароль"
        placeholder="Минимум 8 символов"
        autoComplete="new-password"
        hint="Строчная и заглавная буквы, цифра, специальный символ"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <PasswordInput
        label="Повторите пароль"
        placeholder="Ещё раз"
        autoComplete="new-password"
        error={errors.passwordConfirm?.message}
        {...register('passwordConfirm')}
      />
      {errors.root && (
        <p role="alert" className={styles.rootError}>
          {errors.root.message}
        </p>
      )}
      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Сбросить пароль
      </Button>
      <p className={styles.footer}>
        <Link to="/login">Вернуться ко входу</Link>
      </p>
    </form>
  );
}
