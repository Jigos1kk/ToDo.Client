import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { projectApi } from '@/entities/project/api/projectApi';
import { taskApi } from '@/entities/task/api/taskApi';
import type { TaskItem } from '@/entities/task/model/types';
import { membershipApi } from '@/entities/membership/api/membershipApi';
import type { Membership } from '@/entities/membership/model/types';
import { fileApi } from '@/entities/file/api/fileApi';
import { useAuthStore, useUser } from '@/entities/user';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  Skeleton,
  Table,
  Textarea,
  useToast,
  type TableColumn,
} from '@/shared/ui';
import { getApiErrorMessage } from '@/shared/api/httpClient';
import { formatDate, formatDateTime } from '@/shared/lib/formatDate';

import styles from './ProjectDetailsPage.module.css';

/* ----- Zod-схемы ----- */



/* ----- Компоненты ----- */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type TabKey = 'tasks' | 'files' | 'memberships';

export function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const user = useUser();
  const hasRole = useAuthStore((s) => s.hasRole);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('tasks');
  const [isCreateTaskOpen, setCreateTaskOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ----- Проект ----- */

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError,
    error: projectErr,
  } = useQuery({
    queryKey: ['project', projectId!],
    queryFn: () => projectApi.getById(projectId!),
    enabled: !!projectId,
  });

  const isOwner = project ? project.creatorId === user?.id : false;
  const canManage = isOwner || hasRole('Admin');
  const canJoin = user && hasRole('Freelancer') && !isOwner && project;

  /* ----- Удаление проекта ----- */

  const deleteMutation = useMutation({
    mutationFn: () => projectApi.remove(projectId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast({ tone: 'success', title: 'Проект удалён' });
      navigate('/', { replace: true });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const handleDeleteProject = () => {
    if (!project) return;
    if (!window.confirm(`Удалить проект «${project.name}»? Это действие нельзя отменить.`)) return;
    deleteMutation.mutate();
  };

  /* ----- Присоединение ----- */

  const joinMutation = useMutation({
    mutationFn: () => membershipApi.join(projectId!),
    onSuccess: () => {
      showToast({ tone: 'success', title: 'Заявка отправлена' });
      queryClient.invalidateQueries({ queryKey: ['memberships', projectId!] });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  /* ----- Задачи ----- */

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId!],
    queryFn: () => taskApi.getByProject(projectId!),
    enabled: !!projectId,
  });

  interface CreateTaskForm {
  title: string;
  description: string;
  dueDate: string;
}

const [createForm, setCreateForm] = useState<CreateTaskForm>({
    title: '',
    description: '',
    dueDate: '',
  });

  const createTaskMutation = useMutation({
    mutationFn: (dto: CreateTaskForm) =>
      taskApi.create(projectId!, {
        title: dto.title,
        description: dto.description ?? null,
        dueDate: dto.dueDate ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId!] });
      showToast({ tone: 'success', title: 'Задача создана' });
      setCreateTaskOpen(false);
      setCreateForm({ title: '', description: '', dueDate: '' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      taskApi.getById(id).then((task) =>
        taskApi.update(id, {
          title: task.title,
          description: task.description,
          isCompleted,
          dueDate: task.dueDate,
        }),
      ),
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', projectId!] });
      const previous = queryClient.getQueryData<TaskItem[]>(['tasks', projectId!]);
      queryClient.setQueryData<TaskItem[]>(['tasks', projectId!], (old) =>
        old?.map((t) => (t.id === id ? { ...t, isCompleted } : t)),
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['tasks', projectId!], ctx.previous);
      }
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId!] });
    },
  });

  /* ----- Файлы ----- */

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['files', 'Project', projectId!],
    queryFn: () => fileApi.getByEntity('Project', projectId!),
    enabled: !!projectId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => fileApi.upload('Project', projectId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'Project', projectId!] });
      showToast({ tone: 'success', title: 'Файл загружен' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: fileApi.download,
    onSuccess: ({ blob, fileName }) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: fileApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'Project', projectId!] });
      showToast({ tone: 'success', title: 'Файл удалён' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /* ----- Заявки ----- */

  const { data: memberships, isLoading: membershipsLoading } = useQuery({
    queryKey: ['memberships', projectId!],
    queryFn: () => membershipApi.getByProject(projectId!),
    enabled: !!projectId && canManage,
  });

  const approveMutation = useMutation({
    mutationFn: membershipApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships', projectId!] });
      showToast({ tone: 'success', title: 'Заявка одобрена' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: membershipApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships', projectId!] });
      showToast({ tone: 'success', title: 'Заявка отклонена' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  /* ----- Колонки таблицы заявок ----- */

  const membershipColumns: TableColumn<Membership>[] = [
    {
      key: 'user',
      header: 'Пользователь',
      render: (m) => m.userId,
    },
    {
      key: 'status',
      header: 'Статус',
      render: (m) => {
        const map: Record<
          string,
          { label: string; tone: 'warning' | 'success' | 'danger' | 'neutral' }
        > = {
          Pending: { label: 'Ожидает', tone: 'warning' },
          Approved: { label: 'Одобрена', tone: 'success' },
          Rejected: { label: 'Отклонена', tone: 'danger' },
        };
        const s = map[m.status] ?? { label: m.status, tone: 'neutral' as const };
        return <Badge tone={s.tone}>{s.label}</Badge>;
      },
    },
    {
      key: 'date',
      header: 'Дата',
      render: (m) => formatDate(m.createdAt),
    },
    {
      key: 'actions',
      header: '',
      render: (m) =>
        m.status === 'Pending' ? (
          <div className={styles.membershipActions}>
            <Button
              size="sm"
              variant="primary"
              onClick={() => approveMutation.mutate(m.id)}
              isLoading={approveMutation.isPending}
            >
              Одобрить
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => rejectMutation.mutate(m.id)}
              isLoading={rejectMutation.isPending}
            >
              Отклонить
            </Button>
          </div>
        ) : null,
    },
  ];

  /* ----- Рендер ----- */

  if (projectError) {
    return (
      <div className={styles.container}>
        <div role="alert" style={{ color: 'var(--color-danger)' }}>
          {getApiErrorMessage(projectErr)}
        </div>
        <Link to="/" className={styles.backBtn}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Назад к проектам
        </Link>
      </div>
    );
  }

  if (projectLoading) {
    return (
      <div className={styles.container}>
        <Skeleton height={28} width="60%" />
        <Skeleton height={16} width="40%" className={styles.skeletonLine} />
        <div style={{ marginTop: 'var(--space-5)' }}>
          <Card className={styles.skeletonCard}>
            <Skeleton height={20} width="50%" />
            <Skeleton height={14} />
            <Skeleton height={14} width="80%" />
          </Card>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className={styles.container}>
      <Link to="/" className={styles.backBtn}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Назад к проектам
      </Link>

      <div className={`${styles.pageHeader} animate-fade-in-up`}>
        <div>
          <h1 className={styles.pageTitle}>{project.name}</h1>
          {project.description && <p className={styles.pageSubtitle}>{project.description}</p>}
        </div>
        <div className={styles.headerActions}>
          {canJoin && (
            <Button
              variant="secondary"
              onClick={() => joinMutation.mutate()}
              isLoading={joinMutation.isPending}
            >
              Присоединиться
            </Button>
          )}
          {canManage && (
            <Button variant="danger" onClick={handleDeleteProject}>
              Удалить проект
            </Button>
          )}
        </div>
      </div>

      {/* Табы */}
      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'tasks' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Задачи
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'files' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Файлы
        </button>
        {canManage && (
          <button
            type="button"
            className={`${styles.tab} ${activeTab === 'memberships' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('memberships')}
          >
            Заявки
          </button>
        )}
      </div>

      {/* Таб: Задачи */}
      {activeTab === 'tasks' && (
        <div className={styles.animateIn}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <Button onClick={() => setCreateTaskOpen(true)}>Создать задачу</Button>
          </div>

          {tasksLoading && (
            <div className={styles.taskList}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className={styles.skeletonCard}>
                  <Skeleton height={20} width="60%" />
                  <Skeleton height={14} />
                  <Skeleton height={12} width="30%" />
                </Card>
              ))}
            </div>
          )}

          {!tasksLoading && tasks && tasks.length > 0 && (
            <div className={styles.taskList}>
              {tasks.map((task) => (
                <Card key={task.id} className={styles.taskCard}>
                  <div className={styles.taskRow}>
                    <input
                      type="checkbox"
                      className={styles.taskCheckbox}
                      checked={task.isCompleted}
                      onChange={() =>
                        toggleTaskMutation.mutate({
                          id: task.id,
                          isCompleted: !task.isCompleted,
                        })
                      }
                      aria-label={`Отметить задачу «${task.title}» как ${task.isCompleted ? 'невыполненную' : 'выполненную'}`}
                    />
                    <div className={styles.taskContent}>
                      <Link
                        to={`/tasks/${task.id}`}
                        className={`${styles.taskTitle} ${task.isCompleted ? styles.taskTitleCompleted : ''}`}
                      >
                        {task.title}
                      </Link>
                      {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                      <div className={styles.taskMeta}>
                        {task.dueDate && (
                          <Badge tone={new Date(task.dueDate) < new Date() ? 'danger' : 'neutral'}>
                            {formatDate(task.dueDate)}
                          </Badge>
                        )}
                        <span className={styles.taskDate}>{formatDate(task.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!tasksLoading && tasks && tasks.length === 0 && (
            <EmptyState
              title="Задач пока нет"
              description="Создайте первую задачу в этом проекте"
              action={<Button onClick={() => setCreateTaskOpen(true)}>Создать задачу</Button>}
            />
          )}
        </div>
      )}

      {/* Таб: Файлы */}
      {activeTab === 'files' && (
        <div className={styles.animateIn}>
          <div className={styles.uploadBtn}>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              aria-label="Выбрать файл для загрузки"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              isLoading={uploadMutation.isPending}
            >
              Загрузить файл
            </Button>
          </div>

          {filesLoading && (
            <div className={styles.fileList}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.fileItem}>
                  <Skeleton height={16} width="50%" />
                  <Skeleton height={16} width="20%" />
                </div>
              ))}
            </div>
          )}

          {!filesLoading && files && files.length > 0 && (
            <div className={styles.fileList}>
              {files.map((f) => (
                <div key={f.id} className={styles.fileItem}>
                  <div className={styles.fileInfo}>
                    <span className={styles.fileIcon} aria-hidden>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                    <div>
                      <div className={styles.fileName}>{f.fileName}</div>
                      <div className={styles.fileMeta}>
                        {formatFileSize(f.fileSize)} · {formatDateTime(f.uploadedAt)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.fileActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label={`Скачать ${f.fileName}`}
                      onClick={() => downloadMutation.mutate(f.id)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </button>
                    {canManage && (
                      <button
                        type="button"
                        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                        aria-label={`Удалить ${f.fileName}`}
                        onClick={() => deleteFileMutation.mutate(f.id)}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!filesLoading && files && files.length === 0 && (
            <EmptyState
              title="Файлов пока нет"
              description="Загрузите первый файл для этого проекта"
            />
          )}
        </div>
      )}

      {/* Таб: Заявки */}
      {activeTab === 'memberships' && (
        <div className={styles.animateIn}>
          <Table
            columns={membershipColumns}
            data={memberships ?? []}
            getRowKey={(m) => m.id}
            isLoading={membershipsLoading}
            emptyContent={
              <EmptyState
                title="Заявок пока нет"
                description="Когда фрилансеры захотят присоединиться, их заявки появятся здесь"
              />
            }
            ariaLabel="Заявки на участие в проекте"
          />
        </div>
      )}

      {/* Модалка создания задачи */}
      <Modal
        isOpen={isCreateTaskOpen}
        onClose={() => {
          setCreateTaskOpen(false);
          setCreateForm({ title: '', description: '', dueDate: '' });
        }}
        title="Создать задачу"
        footer={
          <div className={styles.modalActions}>
            <Button
              variant="secondary"
              onClick={() => {
                setCreateTaskOpen(false);
                setCreateForm({ title: '', description: '', dueDate: '' });
              }}
            >
              Отмена
            </Button>
            <Button
              onClick={() => createTaskMutation.mutate(createForm)}
              isLoading={createTaskMutation.isPending}
            >
              Создать
            </Button>
          </div>
        }
      >
        <div className={styles.modalForm}>
          <Input
            label="Название"
            placeholder="Введите название задачи"
            value={createForm.title}
            onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
            error={createForm.title ? undefined : undefined}
          />
          <Textarea
            label="Описание"
            placeholder="Описание задачи (необязательно)"
            rows={3}
            value={createForm.description}
            onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Срок выполнения"
            type="date"
            value={createForm.dueDate}
            onChange={(e) => setCreateForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
        </div>
      </Modal>
    </div>
  );
}
