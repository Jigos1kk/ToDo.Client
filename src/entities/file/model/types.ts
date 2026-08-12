export type FileEntityType = 'Project' | 'Task' | 'Correction';

/** Прикреплённый файл. */
export interface ProjectFile {
  id: string;
  entityType: FileEntityType;
  entityId: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  uploadedByUserId: string;
  uploadedAt: string;
}
