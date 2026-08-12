import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/api/httpClient';

import type { FileEntityType, ProjectFile } from '../model/types';

export const fileApi = {
  /** Список файлов сущности. */
  async getByEntity(entityType: FileEntityType, entityId: string): Promise<ProjectFile[]> {
    const { data } = await httpClient.get<ProjectFile[]>(`${env.coreApiUrl}/files`, {
      params: { entityType, entityId },
    });
    return data;
  },

  /** Загрузить файл. */
  async upload(
    entityType: FileEntityType,
    entityId: string,
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<ProjectFile> {
    const form = new FormData();
    form.append('entityType', entityType);
    form.append('entityId', entityId);
    form.append('file', file);

    const { data } = await httpClient.post<ProjectFile>(`${env.coreApiUrl}/files/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (event) => {
            if (event.total) onProgress(Math.round((event.loaded * 100) / event.total));
          }
        : undefined,
    });
    return data;
  },

  /** Скачать файл (возвращает blob + contentType). */
  async download(fileId: string): Promise<{ blob: Blob; fileName: string }> {
    const response = await httpClient.get(`${env.coreApiUrl}/files/${fileId}/download`, {
      responseType: 'blob',
    });
    const contentDisposition = (response.headers as Record<string, string>)['content-disposition'];
    const fileName = contentDisposition
      ? decodeURIComponent(contentDisposition.split("filename*=UTF-8''")[1] ?? 'file')
      : 'file';
    return { blob: response.data as Blob, fileName };
  },

  /** Удалить файл. */
  async remove(fileId: string): Promise<void> {
    await httpClient.delete(`${env.coreApiUrl}/files/${fileId}`);
  },
};