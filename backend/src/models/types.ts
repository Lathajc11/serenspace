import { Timestamp } from 'firebase-admin/firestore';

// Mood Types
export type EmotionType = 
  | 'joyful' 
  | 'happy' 
  | 'calm' 
  | 'neutral' 
  | 'anxious' 
  | 'sad' 
  | 'angry' 
  | 'stressed';

export interface Mood {
  id?: string;
  userId: string;
  score: number;
  emotion: EmotionType;
  note?: string;
  tags?: string[];
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

// Post Types
export interface Post {
  id?: string;
  authorId: string;
  content: string;
  isAnonymous: boolean;
  displayName: string;
  likes: number;
  likedBy: string[];
  repliesCount: number;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  isModerated: boolean;
  isDeleted: boolean;
}

// Coping Tool Types
export type ToolCategory = 
  | 'breathing' 
  | 'meditation' 
  | 'grounding' 
  | 'journaling' 
  | 'movement' 
  | 'cognitive';

export interface CopingTool {
  id?: string;
  title: string;
  description: string;
  category: ToolCategory;
  duration: number;
  content: {
    steps: string[];
    mediaUrl?: string;
    breathingPattern?: {
      inhale: number;
      hold: number;
      exhale: number;
    };
  };
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  isPremium: boolean;
  createdAt: Timestamp | Date;
}

// Insight Types
export type InsightType = 
  | 'pattern' 
  | 'trend' 
  | 'suggestion' 
  | 'milestone' 
  | 'alert';

export type MoodTrend = 'improving' | 'stable' | 'declining';

export interface Insight {
  id?: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  data: {
    period: string;
    averageMood: number;
    moodTrend: MoodTrend;
    topEmotions: string[];
    triggers?: string[];
  };
  isRead: boolean;
  createdAt: Timestamp | Date;
  expiresAt: Timestamp | Date;
}

// User Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAnonymous: boolean;
  createdAt: Timestamp | Date;
  lastLoginAt: Timestamp | Date;
  streakDays: number;
  longestStreak: number;
  totalCheckIns: number;
  preferences: {
    dailyReminder: boolean;
    reminderTime: string;
    theme: 'light' | 'dark';
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
