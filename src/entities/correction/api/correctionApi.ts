import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/api/httpClient';

import type { Correction, CorrectionCreateDto } from '../model/types';

export const correctionApi = {
  /** Список корректировок задачи. */
  async getByTask(taskId: string): Promise<Correction[]> {
    const { data } = await httpClient.get<Correction[]>(
      `${env.coreApiUrl}/tasks/${taskId}/corrections`,
    );
    return data;
  },

  /** Добавить корректировку. */
  async create(taskId: string, dto: CorrectionCreateDto): Promise<Correction> {
    const { data } = await httpClient.post<Correction>(
      `${env.coreApiUrl}/tasks/${taskId}/corrections`,
      dto,
    );
    return data;
  },
};