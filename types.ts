
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
  summary?: SummaryData; // Changed from string to structured data
  fileUrl?: string; // Blob URL for display
  keyTopics?: string[]; // AI generated tags
}

export interface SummarySection {
  heading: string;
  content: string;
  keyPoints: string[];
}

export interface SummaryData {
  title: string;
  sections: SummarySection[];
}

export interface StudyTip {
  title: string;
  description: string;
  method: string;
  icon: string; // Emoji or icon name
}

export interface StudyTipsData {
  tips: StudyTip[];
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

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: QuizQuestion[];
}

// --- AI Tutor & Flashcards ---

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardData {
  topic: string;
  cards: Flashcard[];
}

export type TutorMode = 'HUB' | 'SOCRATIC' | 'ELI5' | 'FLASHCARDS';

// --- Audio Learning ---
export interface AudioTrack {
  id: string;
  title: string;
  author: string; // AI Narrator
  src: string; // Blob URL
  duration?: number;
}

// --- Scalability & Integrations ---

export interface LibraryResource {
    id: string;
    title: string;
    author: string;
    type: 'Book' | 'Journal' | 'Paper';
    source: string; // e.g. "RENU", "OpenLibrary"
    url: string;
    year: number;
}

export interface StudentGrade {
    courseCode: string;
    courseTitle: string;
    grade: string;
    score: number;
    credits: number;
}

export interface TimetableEntry {
    id: string;
    day: string;
    time: string;
    course: string;
    room: string;
    type: 'Lecture' | 'Lab' | 'Tutorial';
}

export interface FinancialStatus {
    balance: number;
    currency: string;
    status: 'Paid' | 'Pending' | 'Overdue';
    nextDueDate: string;
    history: { date: string, description: string, amount: number }[];
}

export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    type: 'Study' | 'Exam' | 'Deadline' | 'Other';
    description?: string;
    emailReminder: boolean;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  COURSES = 'courses',
  READING_ROOM = 'reading-room',
  STUDY_GROUPS = 'study-groups', 
  AI_TUTOR = 'ai-tutor',
  RESOURCES = 'resources',
  PORTAL = 'portal',
  SCHEDULE = 'schedule',
  PROFILE = 'profile',
}
