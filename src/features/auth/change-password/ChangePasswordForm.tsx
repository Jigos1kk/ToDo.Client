import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { authApi } from '@/entities/user';
import { getApiErrorMessage } from '@/shared/api/httpClient';
import { Button, PasswordInput, useToast } from '@/shared/ui';

import { passwordSchema } from '../model/validation';
import styles from '../confirm-email/TokenForm.module.css';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль.'),
    newPassword: passwordSchema,
    passwordConfirm: z.string().min(1, 'Подтвердите пароль.'),
  })
  .refine((values) => values.newPassword === values.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Пароли не совпадают.',
  });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', passwordConfirm: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      reset();
      showToast({ tone: 'success', title: 'Пароль изменён' });
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error, 'Не удалось изменить пароль.') });
    }
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <PasswordInput
        label="Текущий пароль"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <PasswordInput
        label="Новый пароль"
        autoComplete="new-password"
        hint="Строчная и заглавная буквы, цифра, специальный символ"
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <PasswordInput
        label="Повторите новый пароль"
        autoComplete="new-password"
        error={errors.passwordConfirm?.message}
        {...register('passwordConfirm')}
      />
      {errors.root && (
        <p role="alert" className={styles.rootError}>
          {errors.root.message}
        </p>
      )}
      <div>
        <Button type="submit" isLoading={isSubmitting}>
          Изменить пароль
        </Button>
      </div>
    </form>
  );
}
