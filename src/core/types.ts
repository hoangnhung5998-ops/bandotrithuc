/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'teacher' | 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  username: string;
  password?: string;
  classId?: string;
  dob?: string;
  parentPhone?: string;
  progressPercent?: number;
  school?: string;
}

export interface Class {
  id: string;
  name: string;
  teacherId: string;
  studentCount: number;
  academicYear: string;
  teacherName: string;
  joinCode: string;
}

export interface Heritage {
  id: string;
  name: string;
  description: string;
  location: string;
  type: 'cultural' | 'natural' | 'historical' | 'music' | 'craft';
  imageUrl: string;
  coordinates: { lat: number; lng: number };
  historicalPeriod?: string;
  youtubeUrl?: string;
  driveUrl?: string;
  webUrl?: string;
}

export interface HistoricalFigure {
  id: string;
  name: string;
  title: string;
  description: string;
  period: string;
  avatar: string;
  achievements: string[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  shortDescription: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  relatedHeritageIds?: string[];
  relatedHistoricalFigureIds?: string[];
  referenceLinks?: string[];
  status: 'draft' | 'published';
  order: number;
  createdAt: number;
}

export interface Activity {
  id: string;
  type: 'reading' | 'video' | 'quiz' | 'ai-chat' | 'map-explore';
  title: string;
  description: string;
  points: number;
}

export interface AIConversation {
  id: string;
  userId: string;
  characterId: string;
  messages: Message[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export type QuestionType = 'multiple-choice' | 'short-answer' | 'sorting' | 'fill-in-the-blanks' | 'true-false' | 'matching';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  matchingOptions?: string[]; // For matching questions (right column)
  correctAnswer: any;
  explanation?: string;
  points?: number;
  topicId?: string;
  level?: 'easy' | 'medium' | 'hard';
}

export interface Progress {
  id: string;
  studentId: string;
  lessonId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt: number;
  completedAt?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface Certificate {
  id: string;
  studentId: string;
  title: string;
  issuedBy: string;
  issuedAt: number;
  type: 'academic' | 'achievement' | 'participation';
  imageUrl?: string;
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: 'students' | 'parents' | 'all';
  createdAt: number;
  createdBy: string;
}

export interface ClassReport {
  totalStudents: number;
  totalLessons: number;
  completedLessons: number;
  totalAssignments: number;
  onTimeSubmissionRate: number;
  averageScore: number;
  completionRate: number;
  scoreDistribution: { range: string; count: number }[];
  studentScores: {
    id: string;
    name: string;
    classId: string;
    completionRate: number;
    averageScore: number;
  }[];
  progressStats: {
    completed: number;
    inProgress: number;
    notStarted: number;
  };
  submissionStats: {
    onTime: number;
    late: number;
    notSubmitted: number;
  };
}

export interface Student {
  id: string;
  name: string;
  averageScore: number;
  lateSubmissions: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classIds: string[];
  lessonId: string;
  dueDate: number;
  maxScore: number;
  type: 'essay' | 'file';
  rubrics: Rubric[];
}

export interface Rubric {
  id: string;
  assignmentId: string;
  criterion: string;
  maxScore: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  fileUrl?: string;
  submittedAt: number;
  score?: number;
  feedback?: string;
  gradedAt?: number;
}

export interface GradebookRecord {
  studentId: string;
  studentName: string;
  scores: { [assignmentId: string]: number | undefined };
  averageScore: number;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  gameUrl: string;
  type: 'quiz' | 'puzzle' | 'adventure' | 'other';
  status: 'active' | 'inactive';
  questionIds?: string[];
  createdAt: number;
}
