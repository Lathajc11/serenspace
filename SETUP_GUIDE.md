# SerenSpace - Complete Setup Guide

This guide will walk you through setting up SerenSpace from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the App](#running-the-app)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, make sure you have:

- [Node.js 18+](https://nodejs.org/) installed
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Firebase](https://firebase.google.com/) account (free)
- A [GitHub](https://github.com/) account (for deployment)
- A code editor like [VS Code](https://code.visualstudio.com/)

---

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter "SerenSpace" as the project name
4. Accept the terms and click "Continue"
5. Disable Google Analytics (or enable if you want) and click "Create project"
6. Wait for the project to be created, then click "Continue"

### Step 2: Enable Authentication

1. In the left sidebar, click "Authentication"
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Toggle to "Enabled"
   - **Google**: Click Google, enable it, select your email, click "Save"
4. Your authentication is now set up!

### Step 3: Create Firestore Database

1. In the left sidebar, click "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location close to you (e.g., "us-central")
5. Click "Enable"

### Step 4: Get Frontend Firebase Config

1. Click the gear icon ⚙️ next to "Project Overview" → "Project settings"
2. Scroll down to "Your apps" section
3. Click the "</>" icon to add a web app
4. Enter "SerenSpace Web" as the app nickname
5. Click "Register app"
6. **Copy the firebaseConfig object** - you'll need this later!
7. Click "Continue to console"

### Step 5: Get Backend Service Account Key

1. In Project Settings, click "Service accounts" tab
2. Click "Generate new private key"
3. Click "Generate key" in the popup
4. **Save the JSON file** - you'll need this!

---

## Backend Setup

### Step 1: Navigate to Backend Folder

```bash
cd serenspace/backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### Step 4: Fill in Environment Variables

Open `.env` in your code editor and fill in:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# From the service account JSON file you downloaded:
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important**: The private key must be on one line with `\n` for newlines.

### Step 5: Run the Backend

```bash
npm run dev
```

You should see:
```
🚀 SerenSpace API server running on port 3001
📍 Environment: development
🔗 Frontend URL: http://localhost:5173
```

✅ **Backend is running!**

---

## Frontend Setup

### Step 1: Navigate to Frontend Folder

Open a **new terminal** window/tab:

```bash
cd serenspace/frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Environment File

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### Step 4: Fill in Environment Variables

Open `.env` in your code editor and fill in from your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

VITE_API_URL=http://localhost:3001/api
```

### Step 5: Run the Frontend

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

✅ **Frontend is running!**

---

## Running the App

### Open in Browser

1. Open Chrome/Firefox/Safari
2. Go to: `http://localhost:5173`
3. You should see the SerenSpace landing page!

### Test the Features

1. **Sign Up**: Click "Get started" and create an account
2. **Check In**: Go to "Check In" and log your mood
3. **View Dashboard**: See your mood chart and stats
4. **Try Tools**: Browse coping tools and try the breathing exercise
5. **Community**: Share an anonymous post
6. **Insights**: Generate personalized insights

### Seed Coping Tools

The first time you run the app, the coping tools library will be empty. To add default tools:

1. Sign in to the app
2. Go to the Tools page
3. If no tools appear, use this curl command (with your auth token):

```bash
# Get your token from browser DevTools > Application > Local Storage
# Or use the Network tab to see the Authorization header

curl -X POST http://localhost:3001/api/tools/seed \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Or manually add tools via the Firebase Console > Firestore Database.

---

## Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Go to [Render](https://render.com) and sign up
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `serenspace-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`
6. Add environment variables (same as `.env` but without quotes around private key)
7. Click "Create Web Service"

### Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign up
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
5. Add environment variables (same as `.env`)
6. Update `VITE_API_URL` to your Render URL (e.g., `https://serenspace-api.onrender.com/api`)
7. Click "Deploy"

### Update Firebase Auth Domain

After deploying to Vercel:

1. Go to Firebase Console > Authentication > Settings > Authorized domains
2. Click "Add domain"
3. Add your Vercel domain (e.g., `serenspace.vercel.app`)

---

## Troubleshooting

### Backend Issues

**Error: "Error: Could not load the default credentials"**
- Your Firebase service account credentials are wrong
- Double-check `.env` file values
- Make sure private key has `\n` for newlines

**Error: "Port 3001 is already in use"**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3001   # Windows
```

### Frontend Issues

**Error: "Failed to load module"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Blank page after login**
- Check browser console for errors
- Verify Firebase config is correct
- Check that backend is running

**CORS errors**
- Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
- For production, add your Vercel domain to CORS origins

### Firebase Issues

**"Permission denied" errors**
- Your Firestore security rules are too strict
- Go to Firebase Console > Firestore Database > Rules
- Temporarily use these rules for development:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Next Steps

Now that your app is running, you can:

1. **Customize the design** - Edit Tailwind classes in the components
2. **Add more coping tools** - Edit `backend/src/routes/tools.ts`
3. **Add notifications** - Set up Firebase Cloud Messaging
4. **Add premium features** - Integrate Stripe for payments
5. **Build mobile app** - Use React Native or Capacitor

---

## Need Help?

- Check the [Firebase Documentation](https://firebase.google.com/docs)
- Read the [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- Review [React Router Docs](https://reactrouter.com/en/main)
- Open an issue on GitHub

---

**You're all set! Enjoy building with SerenSpace! 🌿**
