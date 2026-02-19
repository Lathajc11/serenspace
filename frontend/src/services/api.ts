import { getIdToken, auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic fetch with auth
async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await getIdToken(user);
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response;
}

// Mood types
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
  id: string;
  userId: string;
  score: number;
  emotion: EmotionType;
  note?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MoodStats {
  averageScore: number;
  totalEntries: number;
  topEmotion: string | null;
  trend: 'improving' | 'stable' | 'declining';
  period: string;
}

// Mood API
export const moodApi = {
  // Create mood entry
  create: async (data: {
    score: number;
    emotion: EmotionType;
    note?: string;
    tags?: string[];
  }): Promise<Mood> => {
    const response = await fetchWithAuth('/moods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.data;
  },

  // Get mood history
  getAll: async (days: number = 30): Promise<Mood[]> => {
    const response = await fetchWithAuth(`/moods?days=${days}`);
    const result = await response.json();
    return result.data;
  },

  // Get mood stats
  getStats: async (days: number = 30): Promise<MoodStats> => {
    const response = await fetchWithAuth(`/moods/stats?days=${days}`);
    const result = await response.json();
    return result.data;
  },

  // Get single mood
  getById: async (id: string): Promise<Mood> => {
    const response = await fetchWithAuth(`/moods/${id}`);
    const result = await response.json();
    return result.data;
  },

  // Update mood
  update: async (id: string, data: Partial<Mood>): Promise<Mood> => {
    const response = await fetchWithAuth(`/moods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.data;
  },

  // Delete mood
  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/moods/${id}`, {
      method: 'DELETE',
    });
  },
};

// Post types
export interface Post {
  id: string;
  authorId: string;
  content: string;
  isAnonymous: boolean;
  displayName: string;
  likes: number;
  likedBy: string[];
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  isModerated: boolean;
  isDeleted: boolean;
}

// Post API
export const postApi = {
  // Create post
  create: async (data: { content: string; isAnonymous?: boolean }): Promise<Post> => {
    const response = await fetchWithAuth('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await response.json();
    return result.data;
  },

  // Get all posts
  getAll: async (limit: number = 20): Promise<Post[]> => {
    const response = await fetchWithAuth(`/posts?limit=${limit}`);
    const result = await response.json();
    return result.data;
  },

  // Get my posts
  getMyPosts: async (): Promise<Post[]> => {
    const response = await fetchWithAuth('/posts/my');
    const result = await response.json();
    return result.data;
  },

  // Toggle like
  toggleLike: async (id: string): Promise<{ liked: boolean }> => {
    const response = await fetchWithAuth(`/posts/${id}/like`, {
      method: 'POST',
    });
    const result = await response.json();
    return result.data;
  },

  // Delete post
  delete: async (id: string): Promise<void> => {
    await fetchWithAuth(`/posts/${id}`, {
      method: 'DELETE',
    });
  },

  // Report post
  report: async (id: string, reason: string): Promise<void> => {
    await fetchWithAuth(`/posts/${id}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Insight types
export type InsightType = 'pattern' | 'trend' | 'suggestion' | 'milestone' | 'alert';

export interface Insight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  data: {
    period: string;
    averageMood: number;
    moodTrend: string;
    topEmotions: string[];
  };
  isRead: boolean;
  createdAt: string;
  expiresAt: string;
}

// Insight API
export const insightApi = {
  // Generate insights
  generate: async (): Promise<Insight[]> => {
    const response = await fetchWithAuth('/insights/generate', {
      method: 'POST',
    });
    const result = await response.json();
    return result.data;
  },

  // Get insights
  getAll: async (unreadOnly: boolean = false): Promise<Insight[]> => {
    const response = await fetchWithAuth(`/insights?unreadOnly=${unreadOnly}`);
    const result = await response.json();
    return result.data;
  },

  // Mark as read
  markRead: async (id: string): Promise<void> => {
    await fetchWithAuth(`/insights/${id}/read`, {
      method: 'PUT',
    });
  },
};

// Tool types
export type ToolCategory = 
  | 'breathing' 
  | 'meditation' 
  | 'grounding' 
  | 'journaling' 
  | 'movement' 
  | 'cognitive';

export interface CopingTool {
  id: string;
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
}

// Tool API
export const toolApi = {
  // Get all tools
  getAll: async (category?: string): Promise<CopingTool[]> => {
    const url = category ? `/tools?category=${category}` : '/tools';
    const response = await fetchWithAuth(url);
    const result = await response.json();
    return result.data;
  },

  // Get single tool
  getById: async (id: string): Promise<CopingTool> => {
    const response = await fetchWithAuth(`/tools/${id}`);
    const result = await response.json();
    return result.data;
  },

  // Get categories
  getCategories: async (): Promise<{ id: string; name: string; description: string }[]> => {
    const response = await fetchWithAuth('/tools/meta/categories');
    const result = await response.json();
    return result.data;
  },
};
