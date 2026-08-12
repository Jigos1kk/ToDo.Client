import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import { authApi } from '@/entities/user';
import { getApiErrorMessage } from '@/shared/api/httpClient';
import { Button, Input, PasswordInput, Select } from '@/shared/ui';

import { emailSchema, passwordSchema, userNameSchema } from '../model/validation';
import styles from './RegisterForm.module.css';

const registerSchema = z
  .object({
    email: emailSchema,
    userName: userNameSchema,
    password: passwordSchema,
    passwordConfirm: z.string().min(1, 'Подтвердите пароль.'),
    role: z.enum(['Customer', 'Freelancer']),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Пароли не совпадают.',
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  // После регистрации токены не выдаются — показываем экран «подтвердите email»
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      userName: '',
      password: '',
      passwordConfirm: '',
      role: 'Freelancer',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authApi.register({
        email: values.email,
        userName: values.userName,
        password: values.password,
        role: values.role,
      });
      setRegisteredEmail(values.email);
    } catch (error) {
      setError('root', { message: getApiErrorMessage(error, 'Не удалось создать аккаунт.') });
    }
  });

  if (registeredEmail) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon} aria-hidden>
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            <path d="m22 6-10 7L2 6" />
          </svg>
        </div>
        <h2 className={styles.successTitle}>Проверьте почту</h2>
        <p className={styles.successText}>
          Мы отправили письмо с токеном подтверждения на <strong>{registeredEmail}</strong>. Введите
          его на странице подтверждения, затем войдите в аккаунт.
        </p>
        <Link to="/confirm-email" className={styles.successLink}>
          <Button fullWidth>Подтвердить email</Button>
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
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Имя пользователя"
        placeholder="ivan_petrov"
        autoComplete="username"
        hint="Буквы, цифры и символы _, ., - (от 3 символов)"
        error={errors.userName?.message}
        {...register('userName')}
      />
      <PasswordInput
        label="Пароль"
        placeholder="Минимум 8 символов"
        autoComplete="new-password"
        hint="Строчная и заглавная буквы, цифра, специальный символ"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordInput
        label="Повторите пароль"
        placeholder="Ещё раз"
        autoComplete="new-password"
        error={errors.passwordConfirm?.message}
        {...register('passwordConfirm')}
      />
      <Select
        label="Я регистрируюсь как"
        hint="Роль влияет на доступные возможности платформы"
        error={errors.role?.message}
        {...register('role')}
      >
        <option value="Freelancer">Фрилансер — выполняю задачи</option>
        <option value="Customer">Заказчик — размещаю задачи</option>
      </Select>
      {errors.root && (
        <p role="alert" className={styles.rootError}>
          {errors.root.message}
        </p>
      )}
      <Button type="submit" fullWidth isLoading={isSubmitting}>
        Создать аккаунт
      </Button>
      <p className={styles.footer}>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </form>
  );
}
