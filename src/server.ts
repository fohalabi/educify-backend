// Main server setup for database connection and route handling

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import authRoutes from './routes/auth';
import tutorRoutes from './routes/tutor';
import bookingRoutes from './routes/booking';
import paymentRoutes from './routes/payments';

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'educify',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD
});

pool.connect()
  .then(() => console.log('PostgreSQL Connected'))
  .catch(err => console.error('Database Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));