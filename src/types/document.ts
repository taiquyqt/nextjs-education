export interface Document {
  id: number;
  title: string;
  description: string | null;
  filePath: string;
  fileType: string;
  createdBy: string;
  classId: number;
  downloadCount: number;
  createdAt: string; // ISO datetime string (Instant từ backend)
  updatedAt: string; // ISO datetime string
}
