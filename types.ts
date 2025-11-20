
export interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  thumbnail: string;
  totalModules: number;
  completedModules: number;
}

export interface Document {
  id: string;
  title: string;
  type: 'PDF' | 'DOCX' | 'TXT';
  uploadDate: string;
  category: string;
  content: string; 
  contextReady: boolean; // AI Context Synthesized
  summary?: string;
}

export interface UserStats {
  points: number;
  level: number;
  streak: number;
  readingTimeMinutes: number;
  badges: string[];
}

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  COURSES = 'courses',
  DOCUMENTS = 'documents',
  READING_ROOM = 'reading-room',
  COMMUNITY = 'community',
  AI_TUTOR = 'ai-tutor',
  PROFILE = 'profile',
}
