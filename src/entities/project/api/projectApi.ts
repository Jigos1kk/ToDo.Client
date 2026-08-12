import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/api/httpClient';

import type { Project, ProjectCreateDto, ProjectUpdateDto } from '../model/types';

export const projectApi = {
  async getAll(): Promise<Project[]> {
    const { data } = await httpClient.get<Project[]>(`${env.coreApiUrl}/projects`);
    return data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await httpClient.get<Project>(`${env.coreApiUrl}/projects/${id}`);
    return data;
  },

  async create(dto: ProjectCreateDto): Promise<Project> {
    const { data } = await httpClient.post<Project>(`${env.coreApiUrl}/projects`, dto);
    return data;
  },

  async update(id: string, dto: ProjectUpdateDto): Promise<void> {
    await httpClient.put(`${env.coreApiUrl}/projects/${id}`, dto);
  },

  async remove(id: string): Promise<void> {
    await httpClient.delete(`${env.coreApiUrl}/projects/${id}`);
  },
};
