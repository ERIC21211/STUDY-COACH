export type UserRole = 'student' | 'lecturer';

export interface MasteryRecord {
  topicId: string;
  score: number; // 0-100
  attempts: number;
  lastAttemptDate: number;
  timeSpent: number; // seconds
  status: 'novice' | 'competent' | 'mastered';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level: number; // 1, 2, 3
  completedTopicIds: string[];
  xp: number;
  lives: number;
  mastery?: Record<string, MasteryRecord>; // Map topicId -> Mastery
  recentErrors?: string[];
  lecturerFeedback?: string;
}

export interface Module {
  id: string;
  code: string;
  title: string;
  description: string;
  minLevel: number;
  creatorId: string;
}

export interface Topic {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  order: number;
  type: 'theory' | 'quiz' | 'practical';
  quizQuestion?: string;
  options?: string[];
  correctOptionIndex?: number;
  xpReward?: number;
  practicalTask?: string;
  initialCode?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
