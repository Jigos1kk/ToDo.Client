import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/api/httpClient';

import type { TaskItem, TaskCreateDto, TaskUpdateDto } from '../model/types';

export const taskApi = {
  /** Получить корневые задачи проекта. */
  async getByProject(projectId: string): Promise<TaskItem[]> {
    const { data } = await httpClient.get<TaskItem[]>(
      `${env.coreApiUrl}/projects/${projectId}/tasks`,
    );
    return data;
  },

  /** Создать задачу в проекте. */
  async create(projectId: string, dto: TaskCreateDto): Promise<TaskItem> {
    const { data } = await httpClient.post<TaskItem>(
      `${env.coreApiUrl}/projects/${projectId}/tasks`,
      dto,
    );
    return data;
  },

  /** Получить задачу по ID. */
  async getById(id: string): Promise<TaskItem> {
    const { data } = await httpClient.get<TaskItem>(`${env.coreApiUrl}/tasks/${id}`);
    return data;
  },

  /** Обновить задачу. */
  async update(id: string, dto: TaskUpdateDto): Promise<void> {
    await httpClient.put(`${env.coreApiUrl}/tasks/${id}`, dto);
  },

  /** Удалить задачу вместе с подзадачами. */
  async remove(id: string): Promise<void> {
    await httpClient.delete(`${env.coreApiUrl}/tasks/${id}`);
  },

  /** Получить подзадачи задачи. */
  async getSubtasks(taskId: string): Promise<TaskItem[]> {
    const { data } = await httpClient.get<TaskItem[]>(`${env.coreApiUrl}/tasks/${taskId}/subtasks`);
    return data;
  },

  /** Создать подзадачу. */
  async createSubtask(parentTaskId: string, dto: TaskCreateDto): Promise<TaskItem> {
    const { data } = await httpClient.post<TaskItem>(
      `${env.coreApiUrl}/tasks/${parentTaskId}/subtasks`,
      dto,
    );
    return data;
  },
};
