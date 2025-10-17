// Tutor management and location endpoints
// handles tutor profiles, management and searching

import express, { Request, Response } from 'express';
import { pool } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all tutors with filters 
router.get('/', async (req: Request, res: Response) => {
  try {
    const { subject, minRate, maxRate, location } = req.query;

    let query = `
      SELECT t.*, u.name, u.email, u.phone,
             COALESCE(json_agg(DISTINCT e.*) FILTER (WHERE e.id IS NOT NULL), '[]') as education,
             COALESCE(json_agg(DISTINCT a.*) FILTER (WHERE a.id IS NOT NULL), '[]') as availability
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN education e ON t.id = e.tutor_id
      LEFT JOIN availability a ON t.id = a.tutor_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 1;

    if (subject) {
      query += ` AND t.subject ILIKE $${paramCount}`;
      params.push(`%${subject}%`);
      paramCount++;
    }

    if (minRate) {
      query += ` AND t.rate >= $${paramCount}`;
      params.push(minRate);
      paramCount++;
    }

    if (maxRate) {
      query += ` AND t.rate <= $${paramCount}`;
      params.push(maxRate);
      paramCount++;
    }

    query += ' GROUP BY t.id, u.name, u.email, u.phone ORDER BY t.rating DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single tutor by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tutorQuery = `
      SELECT t.*, u.name, u.email, u.phone,
             COALESCE(json_agg(DISTINCT e.*) FILTER (WHERE e.id IS NOT NULL), '[]') as education,
             COALESCE(json_agg(DISTINCT a.*) FILTER (WHERE a.id IS NOT NULL), '[]') as availability
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN education e ON t.id = e.tutor_id
      LEFT JOIN availability a ON t.id = a.tutor_id
      WHERE t.id = $1
      GROUP BY t.id, u.name, u.email, u.phone
    `;

    const tutorResult = await pool.query(tutorQuery, [id]);

    if (tutorResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tutor not found' });
    }

    const reviewsQuery = `
      SELECT r.*, u.name as student_name
      FROM reviews r
      JOIN users u ON r.student_id = u.id
      WHERE r.tutor_id = $1
      ORDER BY r.created_at DESC
    `;
    const reviewsResult = await pool.query(reviewsQuery, [id]);

    const tutor = tutorResult.rows[0];
    tutor.reviews = reviewsResult.rows;

    res.json(tutor);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create tutor profile
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { subject, rate, experience, languages, bio, location_address, location_lat, location_lng } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO tutors (user_id, subject, rate, experience, languages, bio, location_address, location_lat, location_lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [userId, subject, rate, experience, languages, bio, location_address, location_lat, location_lng]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update tutor availability
router.put('/:id/availability', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { day_of_week, start_time, end_time, is_available } = req.body;

    const result = await pool.query(
      `INSERT INTO availability (tutor_id, day_of_week, start_time, end_time, is_available)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, day_of_week, start_time, end_time, is_available]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Search tutors by location
router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const radiusKm = radius ? parseFloat(radius as string) : 10; // Default 10km

    // Calculate nearby tutors using Haversine formula
    const query = `
      SELECT t.*, u.name, u.email,
             (6371 * acos(
               cos(radians($1)) * cos(radians(t.location_lat)) *
               cos(radians(t.location_lng) - radians($2)) +
               sin(radians($1)) * sin(radians(t.location_lat))
             )) AS distance
      FROM tutors t
      JOIN users u ON t.user_id = u.id
      WHERE t.location_lat IS NOT NULL 
        AND t.location_lng IS NOT NULL
      HAVING distance <= $3
      ORDER BY distance ASC
    `;

    const result = await pool.query(query, [lat, lng, radiusKm]);

    res.json({
      tutors: result.rows,
      center: { lat: parseFloat(lat as string), lng: parseFloat(lng as string) },
      radius: radiusKm
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;