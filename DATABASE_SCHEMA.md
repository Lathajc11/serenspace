# SerenSpace - Database Schema (Firestore)

## Collections Overview

```
users/          {userId}          - User profiles
moods/          {moodId}          - Mood check-in entries
posts/          {postId}          - Community posts
copingTools/    {toolId}          - Coping exercises library
insights/       {insightId}       - Generated user insights
```

---

## 1. Users Collection

**Path:** `users/{userId}`

```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;                  // User email
  displayName: string;            // Display name (can be anonymous)
  photoURL: string | null;        // Profile photo URL
  isAnonymous: boolean;           // Anonymous account flag
  createdAt: Timestamp;           // Account creation date
  lastLoginAt: Timestamp;         // Last login timestamp
  streakDays: number;             // Current check-in streak
  longestStreak: number;          // Longest streak achieved
  totalCheckIns: number;          // Total mood entries
  preferences: {
    dailyReminder: boolean;       // Enable daily reminders
    reminderTime: string;         // "09:00" format
    theme: 'light' | 'dark';      // UI theme preference
  };
}
```

**Security Rules:**
```
allow read, write: if request.auth != null && request.auth.uid == userId;
```

---

## 2. Moods Collection

**Path:** `moods/{moodId}`

```typescript
interface Mood {
  id: string;                     // Auto-generated ID
  userId: string;                 // Reference to users/{userId}
  score: number;                  // 1-10 mood scale
  emotion: EmotionType;           // Primary emotion
  note: string;                   // Optional journal note (max 500 chars)
  tags: string[];                 // Tags like ["work", "family", "sleep"]
  createdAt: Timestamp;           // Entry timestamp
  updatedAt: Timestamp;           // Last update
}

type EmotionType = 
  | 'joyful' 
  | 'happy' 
  | 'calm' 
  | 'neutral' 
  | 'anxious' 
  | 'sad' 
  | 'angry' 
  | 'stressed';
```

**Indexes:**
```
Collection: moods
Fields:
  - userId (Ascending)
  - createdAt (Descending)
```

**Security Rules:**
```
allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
```

---

## 3. Posts Collection (Community)

**Path:** `posts/{postId}`

```typescript
interface Post {
  id: string;                     // Auto-generated ID
  authorId: string;               // Reference to users/{userId}
  content: string;                // Post content (max 1000 chars)
  isAnonymous: boolean;           // Show as anonymous
  displayName: string;            // "Anonymous" or user name
  likes: number;                  // Like count
  likedBy: string[];              // Array of user IDs who liked
  repliesCount: number;           // Number of replies
  createdAt: Timestamp;           // Post timestamp
  updatedAt: Timestamp;           // Last update
  isModerated: boolean;           // Flagged by moderation
  isDeleted: boolean;             // Soft delete flag
}
```

**Security Rules:**
```
allow read: if request.auth != null;
allow create: if request.auth != null 
  && request.resource.data.authorId == request.auth.uid
  && request.resource.data.content.size() <= 1000;
allow update, delete: if request.auth != null 
  && resource.data.authorId == request.auth.uid;
```

---

## 4. Coping Tools Collection

**Path:** `copingTools/{toolId}`

```typescript
interface CopingTool {
  id: string;                     // Tool ID
  title: string;                  // Tool name
  description: string;            // Short description
  category: ToolCategory;         // Tool type
  duration: number;               // Estimated duration in minutes
  content: {
    steps: string[];              // Step-by-step instructions
    mediaUrl?: string;            // Optional audio/video URL
    breathingPattern?: {          // For breathing exercises
      inhale: number;             // Seconds
      hold: number;               // Seconds
      exhale: number;             // Seconds
    };
  };
  tags: string[];                 // ["anxiety", "stress", "sleep"]
  difficulty: 'easy' | 'medium' | 'hard';
  isPremium: boolean;             // Premium-only content
  createdAt: Timestamp;
}

type ToolCategory = 
  | 'breathing' 
  | 'meditation' 
  | 'grounding' 
  | 'journaling' 
  | 'movement' 
  | 'cognitive';
```

**Security Rules:**
```
allow read: if request.auth != null;
allow write: if false;  // Only admin via backend
```

---

## 5. Insights Collection

**Path:** `insights/{insightId}`

```typescript
interface Insight {
  id: string;                     // Auto-generated ID
  userId: string;                 // Reference to users/{userId}
  type: InsightType;              // Type of insight
  title: string;                  // Insight title
  description: string;            // Detailed explanation
  data: {
    period: string;               // "7d", "30d", "90d"
    averageMood: number;          // Average mood score
    moodTrend: 'improving' | 'stable' | 'declining';
    topEmotions: string[];        // Most frequent emotions
    triggers: string[];           // Identified triggers
  };
  isRead: boolean;                // User has seen it
  createdAt: Timestamp;
  expiresAt: Timestamp;           // Insight relevance expiry
}

type InsightType = 
  | 'pattern' 
  | 'trend' 
  | 'suggestion' 
  | 'milestone' 
  | 'alert';
```

---

## 6. User Favorites (Subcollection)

**Path:** `users/{userId}/favorites/{toolId}`

```typescript
interface Favorite {
  toolId: string;                 // Reference to copingTools
  addedAt: Timestamp;
}
```

---

## Sample Queries

### Get User's Mood History (Last 7 Days)
```javascript
db.collection('moods')
  .where('userId', '==', userId)
  .where('createdAt', '>=', sevenDaysAgo)
  .orderBy('createdAt', 'desc')
  .get();
```

### Get Community Posts (Paginated)
```javascript
db.collection('posts')
  .where('isDeleted', '==', false)
  .where('isModerated', '==', false)
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
```

### Get Coping Tools by Category
```javascript
db.collection('copingTools')
  .where('category', '==', 'breathing')
  .where('isPremium', '==', false)
  .get();
```

---

## Data Retention Policy

1. **Mood Entries:** Kept indefinitely (user-owned)
2. **Posts:** Soft delete, purged after 30 days
3. **Insights:** Auto-deleted after 90 days
4. **Anonymous Accounts:** Deleted after 30 days of inactivity
