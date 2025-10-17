// Payments Processing Endpoints
// handles payment creation and retrieval by booking ID

import express, { Response } from 'express';
import { pool } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create payment
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { booking_id, amount, payment_method } = req.body;
    const studentId = req.user.id;

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await pool.query(
      `INSERT INTO payments (booking_id, student_id, amount, payment_method, transaction_id, status)
       VALUES ($1, $2, $3, $4, $5, 'completed') RETURNING *`,
      [booking_id, studentId, amount, payment_method, transactionId]
    );

    // Update booking status to confirmed
    await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2',
      ['confirmed', booking_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get payment by booking
router.get('/booking/:bookingId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { bookingId } = req.params;

    const result = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1',
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;