/** Корректировка к задаче. */
export interface Correction {
  id: string;
  taskId: string;
  authorId: string;
  description: string;
  createdAt: string;
}

export interface CorrectionCreateDto {
  description: string;
}