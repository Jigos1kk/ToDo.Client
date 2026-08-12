import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import { authApi } from '@/entities/user';
import { getApiErrorMessage } from '@/shared/api/httpClient';
import { Button, Input, useToast } from '@/shared/ui';

import styles from './TokenForm.module.css';

const confirmEmailSchema = z.object({
  token: z.string().min(1, 'Введите токен из письма.'),
});

type ConfirmEmailFormValues = z.infer<typeof confirmEmailSchema>;

export function ConfirmEmailForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ConfirmEmailFormValues>({
    resolver: zodResolver(confirmEmailSchema),
    // Токен можно передать в ссылке: /confirm-email?token=...
    defaultValues: { token: searchParams.get('token') ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.confirmEmail(values.token.trim());
      showToast({
        tone: 'success',
        title: 'Email подтверждён',
        description: 'Теперь можно войти.',
      });
      navigate('/login', { replace: true });
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error, 'Не удалось подтвердить email.') });
    }
  });

  return (
    <form onSubmit={onSubmit} className={styles.form} noValidate>
      <Input
        label="Токен подтверждения"
        placeholder="Вставьте токен из письма"
        autoFocus
        error={errors.token?.message}
        {...register('token')}
      />
      {errors.root && (
        <p role="alert" className={styles.rootError}>
          {errors.root.message}
        </p>
      )}
      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Подтвердить
      </Button>
      <p className={styles.footer}>
        <Link to="/login">Вернуться ко входу</Link>
      </p>
    </form>
  );
}
