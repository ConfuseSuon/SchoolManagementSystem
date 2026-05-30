export interface PaginationParams {
  page?: number;
  limit?: number;
}

export const queryKeys = {
  schools: {
    all: ['schools'] as const,
    list: (params?: PaginationParams) => [...queryKeys.schools.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.schools.all, 'detail', id] as const,
  },
  academicClasses: {
    all: ['academic-classes'] as const,
    list: (params?: PaginationParams) => [...queryKeys.academicClasses.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.academicClasses.all, 'detail', id] as const,
  },
  subjects: {
    all: ['subjects'] as const,
    list: (params?: PaginationParams) => [...queryKeys.subjects.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.subjects.all, 'detail', id] as const,
  },
  teachers: {
    all: ['teachers'] as const,
    list: (params?: PaginationParams) => [...queryKeys.teachers.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.teachers.all, 'detail', id] as const,
  },
  students: {
    all: ['students'] as const,
    list: (params?: PaginationParams) => [...queryKeys.students.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.students.all, 'detail', id] as const,
  },
  notices: {
    all: ['notices'] as const,
    list: (params?: PaginationParams) => [...queryKeys.notices.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.notices.all, 'detail', id] as const,
  },
  complains: {
    all: ['complains'] as const,
    list: (params?: PaginationParams) => [...queryKeys.complains.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.complains.all, 'detail', id] as const,
  },
  teacherProfile: {
    current: () => ['teacher-profile'] as const,
  },
  academicYears: {
    all: ['academic-years'] as const,
    list: () => [...queryKeys.academicYears.all, 'list'] as const,
  },
  enrollments: {
    all: ['enrollments'] as const,
    list: (params?: any) => [...queryKeys.enrollments.all, 'list', params] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    list: (params?: any) => [...queryKeys.attendance.all, 'list', params] as const,
    summary: (params?: any) => [...queryKeys.attendance.all, 'summary', params] as const,
  },
  exams: {
    all: ['exams'] as const,
    list: (params?: any) => [...queryKeys.exams.all, 'list', params] as const,
    results: (examId: string) => [...queryKeys.exams.all, 'results', examId] as const,
    studentResults: (params?: any) => [...queryKeys.exams.all, 'student-results', params] as const,
  },
};
