import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import moodRoutes from './routes/moods';
import postRoutes from './routes/posts';
import insightRoutes from './routes/insights';
import toolRoutes from './routes/tools';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://zingy-fairy-b74a46.netlify.app'
    ],
    credentials: true,
  })
);


// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/moods', moodRoutes);
app.use('/api/posts', postRoutes);     // ✅ no limiter
app.use('/api/insights', insightRoutes);
app.use('/api/tools', toolRoutes);

// Root
app.get('/', (_req, res) => {
  res.json({
    name: 'SerenSpace API',
    version: '1.0.0',
    description: 'Mental wellness app backend API',
    endpoints: {
      moods: '/api/moods',
      posts: '/api/posts',
      insights: '/api/insights',
      tools: '/api/tools',
      health: '/health',
    },
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : err.message,
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SerenSpace API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(
    `🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`
  );
});

export default app;
