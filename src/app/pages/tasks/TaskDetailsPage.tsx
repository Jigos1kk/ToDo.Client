import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { taskApi } from '@/entities/task/api/taskApi';
import type { TaskCreateDto, TaskItem } from '@/entities/task/model/types';
import { correctionApi } from '@/entities/correction/api/correctionApi';
import type { CorrectionCreateDto } from '@/entities/correction/model/types';
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
  Textarea,
  useToast,
} from '@/shared/ui';
import { getApiErrorMessage } from '@/shared/api/httpClient';
import { formatDate, formatDateTime } from '@/shared/lib/formatDate';

import styles from './TaskDetailsPage.module.css';

/* ----- Helpers ----- */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskDetailsPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const user = useUser();
  const hasRole = useAuthStore((s) => s.hasRole);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ----- Основная задача ----- */

  const {
    data: task,
    isLoading: taskLoading,
    isError: taskError,
    error: taskErr,
  } = useQuery({
    queryKey: ['task', taskId!],
    queryFn: () => taskApi.getById(taskId!),
    enabled: !!taskId,
  });

  const canManage = task && (task.creatorId === user?.id || hasRole('Admin'));

  /* ----- Delete task ----- */

  const deleteMutation = useMutation({
    mutationFn: () => taskApi.remove(taskId!),
    onSuccess: () => {
      showToast({ tone: 'success', title: 'Задача удалена' });
      navigate(`/projects/${task?.projectId}`, { replace: true });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const handleDelete = () => {
    if (!window.confirm('Удалить задачу? Это действие нельзя отменить.')) return;
    deleteMutation.mutate();
  };

  /* ----- Toggle isCompleted ----- */

  const toggleMutation = useMutation({
    mutationFn: (isCompleted: boolean) =>
      taskApi.update(taskId!, {
        title: task!.title,
        description: task!.description,
        isCompleted,
        dueDate: task!.dueDate,
      }),
    onMutate: async (isCompleted) => {
      await queryClient.cancelQueries({ queryKey: ['task', taskId!] });
      const previous = queryClient.getQueryData<TaskItem>(['task', taskId!]);
      queryClient.setQueryData<TaskItem>(['task', taskId!], (old) =>
        old ? { ...old, isCompleted } : old,
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['task', taskId!], ctx.previous);
      }
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId!] });
    },
  });

  /* ----- Подзадачи ----- */

  const { data: subtasks, isLoading: subtasksLoading } = useQuery({
    queryKey: ['subtasks', taskId!],
    queryFn: () => taskApi.getSubtasks(taskId!),
    enabled: !!taskId,
  });

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const createSubtaskMutation = useMutation({
    mutationFn: (dto: TaskCreateDto) => taskApi.createSubtask(taskId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId!] });
      setNewSubtaskTitle('');
      showToast({ tone: 'success', title: 'Подзадача создана' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) =>
      taskApi.getById(id).then((st) =>
        taskApi.update(id, {
          title: st.title,
          description: st.description,
          isCompleted,
          dueDate: st.dueDate,
        }),
      ),
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: ['subtasks', taskId!] });
      const previous = queryClient.getQueryData<TaskItem[]>(['subtasks', taskId!]);
      queryClient.setQueryData<TaskItem[]>(['subtasks', taskId!], (old) =>
        old?.map((s) => (s.id === id ? { ...s, isCompleted } : s)),
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['subtasks', taskId!], ctx.previous);
      }
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId!] });
    },
  });

  const deleteSubtaskMutation = useMutation({
    mutationFn: taskApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subtasks', taskId!] });
      showToast({ tone: 'success', title: 'Подзадача удалена' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  /* ----- Корректировки ----- */

  const { data: corrections, isLoading: correctionsLoading } = useQuery({
    queryKey: ['corrections', taskId!],
    queryFn: () => correctionApi.getByTask(taskId!),
    enabled: !!taskId,
  });

  const [newCorrectionDesc, setNewCorrectionDesc] = useState('');

  const createCorrectionMutation = useMutation({
    mutationFn: (dto: CorrectionCreateDto) => correctionApi.create(taskId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corrections', taskId!] });
      setNewCorrectionDesc('');
      showToast({ tone: 'success', title: 'Корректировка добавлена' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  /* ----- Файлы задачи ----- */

  const { data: taskFiles, isLoading: taskFilesLoading } = useQuery({
    queryKey: ['files', 'Task', taskId!],
    queryFn: () => fileApi.getByEntity('Task', taskId!),
    enabled: !!taskId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => fileApi.upload('Task', taskId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'Task', taskId!] });
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

  const deleteTaskFileMutation = useMutation({
    mutationFn: fileApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', 'Task', taskId!] });
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

  /* ----- Редактирование задачи (модалка) ----- */

  const [isEditOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    isCompleted: false,
  });

  const openEditModal = () => {
    if (!task) return;
    setEditForm({
      title: task.title,
      description: task.description ?? '',
      dueDate: task.dueDate ?? '',
      isCompleted: task.isCompleted,
    });
    setEditOpen(true);
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      taskApi.update(taskId!, {
        title: editForm.title,
        description: editForm.description || null,
        isCompleted: editForm.isCompleted,
        dueDate: editForm.dueDate || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId!] });
      setEditOpen(false);
      showToast({ tone: 'success', title: 'Задача обновлена' });
    },
    onError: (err) => {
      showToast({ tone: 'error', title: 'Ошибка', description: getApiErrorMessage(err) });
    },
  });

  /* ----- Рендер ----- */

  if (taskError) {
    return (
      <div className={styles.container}>
        <div role="alert" style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>
          {getApiErrorMessage(taskErr)}
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
          Назад
        </Link>
      </div>
    );
  }

  if (taskLoading) {
    return (
      <div className={styles.container}>
        <Card className={styles.skeletonBlock}>
          <Skeleton height={28} width="70%" />
          <Skeleton height={14} width="40%" />
          <Skeleton height={14} />
          <Skeleton height={14} width="80%" />
        </Card>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className={styles.container}>
      <Link to={`/projects/${task.projectId}`} className={styles.backBtn}>
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
        Назад к проекту
      </Link>

      <div className={`${styles.animateIn}`}>
        {/* Заголовок задачи */}
        <div className={styles.taskHeader}>
          <input
            type="checkbox"
            className={styles.taskCheckbox}
            checked={task.isCompleted}
            onChange={() => toggleMutation.mutate(!task.isCompleted)}
            aria-label={`Отметить задачу как ${task.isCompleted ? 'невыполненную' : 'выполненную'}`}
          />
          <div className={styles.taskInfo}>
            <h1
              className={`${styles.taskTitle} ${task.isCompleted ? styles.taskTitleCompleted : ''}`}
            >
              {task.title}
            </h1>
            <div className={styles.taskMeta}>
              <span>Создано: {formatDate(task.createdAt)}</span>
              {task.dueDate && (
                <>
                  <span>·</span>
                  <Badge tone={new Date(task.dueDate) < new Date() ? 'danger' : 'neutral'}>
                    Срок: {formatDate(task.dueDate)}
                  </Badge>
                </>
              )}
            </div>
            {task.description && <p className={styles.taskDesc}>{task.description}</p>}
          </div>
        </div>

        {/* Действия */}
        {canManage && (
          <div className={styles.actions}>
            <Button variant="secondary" onClick={openEditModal}>
              Редактировать
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Удалить
            </Button>
          </div>
        )}

        {/* Подзадачи */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Подзадачи</h2>

          {subtasksLoading && (
            <div className={styles.subtaskList}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={styles.subtaskItem}>
                  <Skeleton height={16} width="80%" />
                </div>
              ))}
            </div>
          )}

          {!subtasksLoading && subtasks && subtasks.length > 0 && (
            <div className={styles.subtaskList}>
              {subtasks.map((st) => (
                <div key={st.id} className={styles.subtaskItem}>
                  <input
                    type="checkbox"
                    className={styles.subtaskCheckbox}
                    checked={st.isCompleted}
                    onChange={() =>
                      toggleSubtaskMutation.mutate({
                        id: st.id,
                        isCompleted: !st.isCompleted,
                      })
                    }
                    aria-label={`Отметить подзадачу «${st.title}»`}
                  />
                  <span
                    className={`${styles.subtaskTitle} ${st.isCompleted ? styles.subtaskTitleCompleted : ''}`}
                  >
                    {st.title}
                  </span>
                  {canManage && (
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                      aria-label={`Удалить подзадачу «${st.title}»`}
                      onClick={() => deleteSubtaskMutation.mutate(st.id)}
                    >
                      <svg
                        width="14"
                        height="14"
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
              ))}
            </div>
          )}

          {!subtasksLoading && subtasks && subtasks.length === 0 && (
            <EmptyState title="Подзадач пока нет" description="Добавьте первую подзадачу" />
          )}

          {/* Форма создания подзадачи */}
          <form
            className={styles.inlineForm}
            onSubmit={(e) => {
              e.preventDefault();
              if (!newSubtaskTitle.trim()) return;
              createSubtaskMutation.mutate({ title: newSubtaskTitle.trim() });
            }}
          >
            <Input
              placeholder="Название подзадачи"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              className={styles.inlineInput}
            />
            <Button type="submit" isLoading={createSubtaskMutation.isPending}>
              Добавить
            </Button>
          </form>
        </div>

        {/* Корректировки */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Корректировки</h2>

          {correctionsLoading && (
            <div className={styles.correctionList}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={styles.correctionItem}>
                  <Skeleton height={16} width="30%" />
                  <Skeleton height={14} className={styles.skeletonLine} />
                </div>
              ))}
            </div>
          )}

          {!correctionsLoading && corrections && corrections.length > 0 && (
            <div className={styles.correctionList}>
              {corrections.map((c) => (
                <div key={c.id} className={styles.correctionItem}>
                  <div className={styles.correctionHeader}>
                    <span className={styles.correctionAuthor}>{c.authorId}</span>
                    <span className={styles.correctionDate}>{formatDateTime(c.createdAt)}</span>
                  </div>
                  <p className={styles.correctionText}>{c.description}</p>
                </div>
              ))}
            </div>
          )}

          {!correctionsLoading && corrections && corrections.length === 0 && (
            <EmptyState
              title="Корректировок пока нет"
              description="Добавьте первую корректировку"
            />
          )}

          {/* Форма добавления корректировки */}
          <form
            style={{
              marginTop: 'var(--space-3)',
              display: 'flex',
              gap: 'var(--space-2)',
              alignItems: 'flex-start',
            }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!newCorrectionDesc.trim()) return;
              createCorrectionMutation.mutate({ description: newCorrectionDesc.trim() });
            }}
          >
            <Textarea
              placeholder="Описание корректировки"
              value={newCorrectionDesc}
              onChange={(e) => setNewCorrectionDesc(e.target.value)}
              rows={2}
              style={{ flex: 1 }}
            />
            <Button type="submit" isLoading={createCorrectionMutation.isPending}>
              Добавить
            </Button>
          </form>
        </div>

        {/* Файлы задачи */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Файлы</h2>

          <div style={{ marginBottom: 'var(--space-3)' }}>
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

          {taskFilesLoading && (
            <div className={styles.fileList}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={styles.fileItem}>
                  <Skeleton height={16} width="50%" />
                  <Skeleton height={16} width="20%" />
                </div>
              ))}
            </div>
          )}

          {!taskFilesLoading && taskFiles && taskFiles.length > 0 && (
            <div className={styles.fileList}>
              {taskFiles.map((f) => (
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
                        onClick={() => deleteTaskFileMutation.mutate(f.id)}
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

          {!taskFilesLoading && taskFiles && taskFiles.length === 0 && (
            <EmptyState
              title="Файлов пока нет"
              description="Загрузите первый файл для этой задачи"
            />
          )}
        </div>
      </div>

      {/* Модалка редактирования задачи */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setEditOpen(false)}
        title="Редактировать задачу"
        footer={
          <div className={styles.modalActions}>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => updateMutation.mutate()} isLoading={updateMutation.isPending}>
              Сохранить
            </Button>
          </div>
        }
      >
        <div className={styles.modalForm}>
          <Input
            label="Название"
            value={editForm.title}
            onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <Textarea
            label="Описание"
            value={editForm.description}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
          />
          <Input
            label="Срок выполнения"
            type="date"
            value={editForm.dueDate}
            onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={editForm.isCompleted}
              onChange={(e) => setEditForm((f) => ({ ...f, isCompleted: e.target.checked }))}
            />
            Задача выполнена
          </label>
        </div>
      </Modal>
    </div>
  );
}
