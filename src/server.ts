import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';

import authRoutes from './routes/auth';
import devRoutes from './routes/dev';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';
import wellnessRoutes from './routes/wellness';
import suggestionRoutes from './routes/suggestion';

import localLogger from './routes/middleware/local-logger';

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());
app.use(localLogger);

// Database Connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

// Routes
app.use('/auth', authRoutes);
app.use('/dev', devRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);
app.use('/wellness', wellnessRoutes);
app.use('/suggestions', suggestionRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to Gesundr API');
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Test Area
});
