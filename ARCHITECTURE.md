# SerenSpace - System Architecture

## Architecture Diagram (Text-Based)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Vercel)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         React + Vite App                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │   Landing   │  │   Auth      │  │  Dashboard  │  │ Community  │ │   │
│  │  │   Page      │  │   Pages     │  │    Page     │  │   Page     │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │ MoodCheckIn │  │   Charts    │  │ CopingTools │  │  Profile   │ │   │
│  │  │  Component  │  │  Component  │  │  Component  │  │   Page     │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │              Firebase Client SDK (Auth + Firestore)          │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FIREBASE (Google Cloud)                           │
│  ┌─────────────────────────┐  ┌─────────────────────────────────────────┐  │
│  │  Firebase Authentication │  │         Cloud Firestore Database        │  │
│  │  ┌─────────────────────┐ │  │  ┌─────────┐ ┌─────────┐ ┌──────────┐ │  │
│  │  │  Email/Password     │ │  │  │  users  │ │  moods  │ │  posts   │ │  │
│  │  │  Google OAuth       │ │  │  │collection│ │collection│ │collection│ │  │
│  │  │  Anonymous Auth     │ │  │  └─────────┘ └─────────┘ └──────────┘ │  │
│  │  └─────────────────────┘ │  │                                         │  │
│  └─────────────────────────┘  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ REST API
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND (Render)                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Express.js Server                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  POST /api/ │  │  GET  /api/ │  │  POST /api/ │  │  GET /api/ │ │   │
│  │  │  moods      │  │  moods      │  │  insights   │  │  insights  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │   │
│  │  │  POST /api/ │  │  GET  /api/ │  │  DELETE /api│  │  GET /api/ │ │   │
│  │  │  posts      │  │  posts      │  │  /user/data │  │  /tools    │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │              Firebase Admin SDK (Server-side)                │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Action → React Component → Firebase Auth (Verify)
                                    ↓
                         Firestore (Direct CRUD)
                                    ↓
                         Express API (Complex Ops)
                                    ↓
                         Response → UI Update
```

## Security Model

```
┌────────────────────────────────────────────────────────────┐
│                    SECURITY RULES                          │
├────────────────────────────────────────────────────────────┤
│  Firestore Rules:                                          │
│  - Users can only read/write their own mood data          │
│  - Posts are anonymous but moderated                       │
│  - Profile data is user-owned                              │
├────────────────────────────────────────────────────────────┤
│  API Security:                                             │
│  - Firebase ID Token verification on each request         │
│  - Rate limiting on post creation                          │
│  - Input validation with Joi/Zod                          │
└────────────────────────────────────────────────────────────┘
```

## Folder Structure

```
serenspace/
├── frontend/                    # React Vite App
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── MoodCheckIn.tsx
│   │   │   ├── MoodChart.tsx
│   │   │   ├── CopingToolCard.tsx
│   │   │   ├── PostCard.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/              # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CheckInPage.tsx
│   │   │   ├── ToolsPage.tsx
│   │   │   ├── CommunityPage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── contexts/           # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useMoods.ts
│   │   │   └── usePosts.ts
│   │   ├── services/           # API services
│   │   │   ├── firebase.ts
│   │   │   ├── moodService.ts
│   │   │   └── postService.ts
│   │   ├── utils/              # Utilities
│   │   │   └── insights.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Express Server
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.ts     # Firebase Admin setup
│   │   ├── middleware/
│   │   │   └── auth.ts         # Token verification
│   │   ├── routes/
│   │   │   ├── moods.ts
│   │   │   ├── posts.ts
│   │   │   ├── insights.ts
│   │   │   └── tools.ts
│   │   ├── controllers/
│   │   │   ├── moodController.ts
│   │   │   ├── postController.ts
│   │   │   └── insightController.ts
│   │   ├── models/
│   │   │   └── types.ts
│   │   └── index.ts            # Server entry
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```
