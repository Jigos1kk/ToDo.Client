/** Проект. Все поля camelCase (стандарт ASP.NET JSON). */
export interface Project {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  createdAt: string;
}

export interface ProjectCreateDto {
  name: string;
  description?: string | null;
}

export interface ProjectUpdateDto {
  name: string;
  description?: string | null;
}
