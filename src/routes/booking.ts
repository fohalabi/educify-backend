// Booking creation and management endpoints
// handles booking creation, retrieval, status updates, and reviews

import express, { Response } from 'express';
import { pool } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user bookings
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user.id;

    const query = `
      SELECT b.*, t.subject, t.rate, u.name as tutor_name
      FROM bookings b
      JOIN tutors t ON b.tutor_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE b.student_id = $1
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create booking
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { tutor_id, subject, booking_date, booking_time, duration, location, amount } = req.body;
    const studentId = req.user.id;

    const result = await pool.query(
      `INSERT INTO bookings (student_id, tutor_id, subject, booking_date, booking_time, duration, location, amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [studentId, tutor_id, subject, booking_date, booking_time, duration, location || 'Online', amount]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update booking status
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add review
router.post('/:id/review', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const bookingId = req.params.id;
    const { rating, comment } = req.body;
    const studentId = req.user.id;

    // Get tutor_id from booking
    const bookingResult = await pool.query('SELECT tutor_id FROM bookings WHERE id = $1', [bookingId]);
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const tutorId = bookingResult.rows[0].tutor_id;

    // Insert review
    const reviewResult = await pool.query(
      `INSERT INTO reviews (tutor_id, student_id, booking_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tutorId, studentId, bookingId, rating, comment]
    );

    // Update tutor rating
    const avgRatingResult = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE tutor_id = $1',
      [tutorId]
    );

    await pool.query(
      'UPDATE tutors SET rating = $1, reviews_count = $2 WHERE id = $3',
      [avgRatingResult.rows[0].avg_rating, avgRatingResult.rows[0].count, tutorId]
    );

    res.status(201).json(reviewResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;