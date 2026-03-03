# SerenSpace - Mental Wellness App
https://zingy-fairy-b74a46.netlify.app/


A full-stack mental wellness application with mood tracking, coping tools, community support, and personalized insights.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Vercel)                        │
│                    React + Vite + TypeScript                     │
│                         Tailwind CSS                             │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (Render)                         │
│                    Node.js + Express + TS                        │
│                      Firebase Admin SDK                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE (Google Cloud)                     │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐   │
│  │  Authentication     │  │  Cloud Firestore                │   │
│  │  (Email, Google)    │  │  - users, moods, posts, tools   │   │
│  └─────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
serenspace/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/         # Firebase Admin config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth middleware
│   │   ├── models/         # TypeScript types
│   │   ├── routes/         # API routes
│   │   └── index.ts        # Server entry
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                # React App
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API & Firebase services
│   │   ├── App.tsx         # Main app
│   │   └── main.tsx        # Entry point
│   ├── index.html
│   └── package.json
│
├── ARCHITECTURE.md          # System architecture
├── DATABASE_SCHEMA.md       # Firestore schema
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Firebase account
- npm or yarn

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** (Email/Password and Google)
4. Create a **Firestore Database** (start in test mode)
5. Go to Project Settings > General
   - Add a web app
   - Copy the Firebase config (for frontend)
6. Go to Project Settings > Service Accounts
   - Generate new private key
   - Save the JSON (for backend)

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Firebase credentials
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY="your-private-key"
# FIREBASE_CLIENT_EMAIL=your-client-email

# Run development server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Firebase config
# VITE_FIREBASE_API_KEY=your-api-key
# VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... etc

# Run development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Seed Coping Tools (Optional)

Once both servers are running, you can seed the coping tools:

```bash
# Using curl or Postman
curl -X POST http://localhost:3001/api/tools/seed \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

Or navigate to the Tools page and the seed button will appear if no tools exist.

## 📝 Environment Variables

### Backend (.env)

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

### Frontend (.env)

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

VITE_API_URL=http://localhost:3001/api
```

## 🌐 Deployment

### Backend (Render)

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repo
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables from `.env`
6. Deploy!

### Frontend (Vercel)

1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set framework preset to "Vite"
3. Add environment variables from `.env`
4. Update `vite.config.ts` API URL for production
5. Deploy!

## 📊 Features

### ✅ Implemented

- [x] User Authentication (Email/Password, Google, Anonymous)
- [x] Mood Check-in (score, emotion, note, tags)
- [x] Mood History & Charts
- [x] Mood Statistics & Trends
- [x] Coping Tools Library
- [x] Breathing Exercise (animated)
- [x] Community Posts (anonymous)
- [x] Like/Report/Delete posts
- [x] Personalized Insights
- [x] User Profile & Stats
- [x] Streak Tracking
- [x] Responsive Design

### 🚧 Coming Soon

- [ ] Push Notifications
- [ ] Premium Subscription
- [ ] Direct Messaging
- [ ] Therapist Integration
- [ ] Mood Journal
- [ ] Data Export
- [ ] Dark Mode
- [ ] Mobile App (React Native)

## 🔒 Security

- Firebase Authentication for secure user management
- Firestore Security Rules protect user data
- Backend token verification on all API routes
- Rate limiting on post creation
- Input validation and sanitization
- Anonymous posting option

## 📱 API Endpoints

### Moods
- `POST /api/moods` - Create mood entry
- `GET /api/moods` - Get mood history
- `GET /api/moods/stats` - Get mood statistics
- `GET /api/moods/:id` - Get specific mood
- `PUT /api/moods/:id` - Update mood
- `DELETE /api/moods/:id` - Delete mood

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - Get all posts
- `GET /api/posts/my` - Get user's posts
- `POST /api/posts/:id/like` - Toggle like
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/report` - Report post

### Insights
- `POST /api/insights/generate` - Generate insights
- `GET /api/insights` - Get insights
- `PUT /api/insights/:id/read` - Mark as read

### Tools
- `GET /api/tools` - Get coping tools
- `GET /api/tools/:id` - Get specific tool
- `GET /api/tools/meta/categories` - Get categories

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

MIT License - feel free to use this for your own projects!

## 💬 Support

If you have questions or need help:
- Open an issue on GitHub
- Email: support@serenspace.app

---

Made with 💙 for better mental wellness
