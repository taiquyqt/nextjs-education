export interface ClassItem {
  data(data: any): unknown;
  id: number;
  className: string;
  schoolYear: number;
  semester: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  teacherId: number;
  subjectId: number;
  joinMode: 'AUTO' | 'APPROVAL' ;
}