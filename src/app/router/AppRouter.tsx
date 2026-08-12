import { Route, Routes } from 'react-router-dom';

import { AppLayout } from '@/app/layout/AppLayout';
import { ConfirmEmailPage } from '@/app/pages/auth/ConfirmEmailPage';
import { ForgotPasswordPage } from '@/app/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/app/pages/auth/LoginPage';
import { RegisterPage } from '@/app/pages/auth/RegisterPage';
import { ResetPasswordPage } from '@/app/pages/auth/ResetPasswordPage';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { ProfilePage } from '@/app/pages/profile/ProfilePage';
import { ProjectDetailsPage } from '@/app/pages/tasks/ProjectDetailsPage';
import { TaskDetailsPage } from '@/app/pages/tasks/TaskDetailsPage';
import { TasksPage } from '@/app/pages/tasks/TasksPage';

import { GuestOnly, RequireAuth } from './guards';

export function AppRouter() {
  return (
    <Routes>
      {/* Публичные страницы (только для гостей) */}
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route
        path="/confirm-email"
        element={
          <GuestOnly>
            <ConfirmEmailPage />
          </GuestOnly>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestOnly>
            <ForgotPasswordPage />
          </GuestOnly>
        }
      />
      <Route
        path="/reset-password"
        element={
          <GuestOnly>
            <ResetPasswordPage />
          </GuestOnly>
        }
      />

      {/* Приватная часть приложения */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<TasksPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
