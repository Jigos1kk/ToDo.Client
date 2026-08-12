import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { projectApi } from '@/entities/project/api/projectApi';
import type { Project } from '@/entities/project/model/types';
import { useAuthStore, useUser } from '@/entities/user';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  Skeleton,
  Textarea,
  useToast,
} from '@/shared/ui';
import { getApiErrorMessage } from '@/shared/api/httpClient';
import { formatDate } from '@/shared/lib/formatDate';

import styles from './TasksPage.module.css';

const createSchema = z.object({
  name: z.string().min(1, 'Обязательно'),
  description: z.string().max(2000).optional().or(z.literal('')),
});

type CreateForm = z.infer<typeof createSchema>;

const TrashIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

function ProjectSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <Skeleton height={22} width="70%" />
      <Skeleton height={14} />
      <Skeleton height={14} />
      <Skeleton height={12} width="40%" />
    </div>
  );
}

export function TasksPage() {
  const user = useUser();
  const hasRole = useAuthStore((s) => s.hasRole);
  const canCreateProject = hasRole('Customer') || hasRole('Admin');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [isCreateOpen, setCreateOpen] = useState(false);

  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: projectApi.getAll,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', description: '' },
  });

  const createMutation = useMutation({
    mutationFn: projectApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast({ tone: 'success', title: 'Проект создан' });
      setCreateOpen(false);
      reset();
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast({ tone: 'success', title: 'Проект удалён' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const handleDelete = (project: Project) => {
    if (!window.confirm(`Удалить проект «${project.name}»? Это действие нельзя отменить.`)) return;
    deleteMutation.mutate(project.id);
  };

  const isOwner = (project: Project) => project.creatorId === user?.id;
  const canDelete = (project: Project) => isOwner(project) || hasRole('Admin');

  const onCreateSubmit = (data: CreateForm) => {
    createMutation.mutate({ name: data.name, description: data.description ?? null });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Проекты</h1>
        {canCreateProject && <Button onClick={() => setCreateOpen(true)}>Создать проект</Button>}
      </div>

      {isError && (
        <div role="alert" style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>
          {getApiErrorMessage(error)}
        </div>
      )}

      <div className={styles.grid}>
        {isLoading && Array.from({ length: 4 }).map((_, i) => <ProjectSkeleton key={i} />)}

        {!isLoading &&
          projects &&
          projects.length > 0 &&
          projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.cardTop}>
                  <h3 className={styles.cardTitle}>{project.name}</h3>
                  {canDelete(project) && (
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      aria-label={`Удалить проект «${project.name}»`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(project);
                      }}
                    >
                      {TrashIcon}
                    </button>
                  )}
                </div>
                {project.description && <p className={styles.cardDesc}>{project.description}</p>}
                <div className={styles.cardFooter}>
                  <span className={styles.cardDate}>{formatDate(project.createdAt)}</span>
                  <Badge tone={isOwner(project) ? 'primary' : 'neutral'}>
                    {isOwner(project) ? 'Создатель' : 'Участник'}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}

        {!isLoading && projects && projects.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              title="Проектов пока нет"
              description="Создайте ваш первый проект, чтобы начать работу"
              action={
                canCreateProject ? (
                  <Button onClick={() => setCreateOpen(true)}>Создать проект</Button>
                ) : undefined
              }
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setCreateOpen(false);
          reset();
        }}
        title="Создать проект"
        footer={
          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                reset();
              }}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              form="create-project-form"
              isLoading={isSubmitting || createMutation.isPending}
            >
              Создать
            </Button>
          </div>
        }
      >
        <form
          id="create-project-form"
          className={styles.modalForm}
          onSubmit={handleSubmit(onCreateSubmit)}
        >
          <Input
            label="Название"
            placeholder="Введите название проекта"
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Описание"
            placeholder="Краткое описание проекта (необязательно)"
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
        </form>
      </Modal>
    </div>
  );
}