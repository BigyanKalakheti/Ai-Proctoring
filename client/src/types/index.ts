export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  photo?: string;
  department: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'paragraph';
  question: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
}

export interface Violation {
  id: string;
  type: 'tab-switch' | 'window-focus' | 'face-not-detected' | 'multiple-faces' | 'phone-detected';
  timestamp: string;
  description: string;
  evidence?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ExamResult {
  id: string;
  userId: string;
  examId: string;
  score: number;
  totalScore: number;
  violations: Violation[];
  startTime: string;
  endTime: string;
  status: 'completed' | 'in-progress' | 'terminated';
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super-admin';
}