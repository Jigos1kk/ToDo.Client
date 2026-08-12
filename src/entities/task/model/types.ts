/** Задача (элемент ToDo). */
export interface TaskItem {
  id: string;
  projectId: string;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  isCompleted: boolean;
  creatorId: string;
  createdAt: string;
  dueDate: string | null;
}

export interface TaskCreateDto {
  title: string;
  description?: string | null;
  dueDate?: string | null;
}

export interface TaskUpdateDto {
  title: string;
  description?: string | null;
  isCompleted: boolean;
  dueDate?: string | null;
}