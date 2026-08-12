import { env } from '@/shared/config/env';
import { httpClient } from '@/shared/api/httpClient';

import type { Membership } from '../model/types';

export const membershipApi = {
  /** Подать заявку (только Freelancer). */
  async join(projectId: string): Promise<Membership> {
    const { data } = await httpClient.post<Membership>(
      `${env.coreApiUrl}/projects/${projectId}/join`,
    );
    return data;
  },

  /** Список всех заявок проекта (создатель/админ). */
  async getByProject(projectId: string): Promise<Membership[]> {
    const { data } = await httpClient.get<Membership[]>(
      `${env.coreApiUrl}/projects/${projectId}/memberships`,
    );
    return data;
  },

  /** Список ожидающих заявок (создатель/админ). */
  async getPending(projectId: string): Promise<Membership[]> {
    const { data } = await httpClient.get<Membership[]>(
      `${env.coreApiUrl}/projects/${projectId}/memberships/pending`,
    );
    return data;
  },

  /** Одобрить заявку. */
  async approve(membershipId: string): Promise<Membership> {
    const { data } = await httpClient.post<Membership>(
      `${env.coreApiUrl}/memberships/${membershipId}/approve`,
    );
    return data;
  },

  /** Отклонить заявку. */
  async reject(membershipId: string): Promise<Membership> {
    const { data } = await httpClient.post<Membership>(
      `${env.coreApiUrl}/memberships/${membershipId}/reject`,
    );
    return data;
  },
};