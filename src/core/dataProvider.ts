import { 
  User, Class, Heritage, HistoricalFigure, Lesson, 
  AIConversation, Quiz, Progress, Achievement, Message,
  Assignment, Submission, GradebookRecord, Announcement,
  ClassReport, Student
} from './types';

export interface DataProvider {
  // Standard CRUD
  getList: <T>(resource: string, params?: any) => Promise<T[]>;
  getOne: <T>(resource: string, id: string, params?: any) => Promise<T>;
  create: <T>(resource: string, data: any) => Promise<T>;
  update: <T>(resource: string, id: string, data: any) => Promise<T>;
  delete: (resource: string, id: string) => Promise<void>;

  // Specialized Actions
  startAIConversation: (characterId: string) => Promise<AIConversation>;
  sendMessageToCharacter: (conversationId: string, message: string) => Promise<Message>;
  generateHeritageImage: (prompt: string) => Promise<string>;
  getInteractiveMapData: () => Promise<Heritage[]>;
  submitQuiz: (quizId: string, answers: number[]) => Promise<{ score: number; total: number }>;
  getStudentProgress: (userId: string) => Promise<Progress[]>;
  getAchievements: (userId: string) => Promise<Achievement[]>;

  // Announcements
  getAnnouncements: (target?: 'students' | 'parents' | 'all') => Promise<Announcement[]>;
  createAnnouncement: (data: Partial<Announcement>) => Promise<Announcement>;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<Announcement>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Reports
  getClassReport: (classId: string) => Promise<ClassReport>;
  getAtRiskStudents: (classId: string) => Promise<Student[]>;

  // Assignments & Submissions
  submitAssignment: (studentId: string, assignmentId: string, content: string, fileUrl?: string) => Promise<Submission>;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => Promise<Submission>;
  getAssignmentsByClass: (classId: string, params?: any) => Promise<Assignment[]>;
  getStudentSubmissions: (studentId: string, params?: any) => Promise<Submission[]>;
  getGradebook: (classId?: string) => Promise<GradebookRecord[]>;

  // Auth
  login: (username: string, password: string) => Promise<User>;
  register: (data: Partial<User> & { password?: string }) => Promise<User>;
  getCurrentUser: () => Promise<User | null>;
  logout: () => Promise<void>;

  // Cache & Sync
  sync: () => Promise<void>;
}
