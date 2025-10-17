// 

import express, { Request, Response } from 'express';
import { pool } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Validate promo code
router.post('/validate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Promo code required' });
    }

    const result = await pool.query(
      `SELECT * FROM promo_codes 
       WHERE code = $1 
       AND is_active = true 
       AND valid_from <= NOW() 
       AND valid_until >= NOW()`,
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid or expired promo code' });
    }

    const promo = result.rows[0];

    // Check usage limit
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      return res.status(400).json({ error: 'Promo code has reached maximum usage' });
    }

    res.json({
      valid: true,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      message: `${promo.discount_type === 'percentage' ? promo.discount_value + '%' : '$' + promo.discount_value} discount applied!`
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Apply promo code to booking
router.post('/apply', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, original_amount } = req.body;

    const promoResult = await pool.query(
      `SELECT * FROM promo_codes 
       WHERE code = $1 
       AND is_active = true 
       AND valid_from <= NOW() 
       AND valid_until >= NOW()`,
      [code.toUpperCase()]
    );

    if (promoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invalid promo code' });
    }

    const promo = promoResult.rows[0];

    let discount = 0;
    let final_amount = original_amount;

    if (promo.discount_type === 'percentage') {
      discount = (original_amount * promo.discount_value) / 100;
      final_amount = original_amount - discount;
    } else if (promo.discount_type === 'fixed') {
      discount = promo.discount_value;
      final_amount = Math.max(0, original_amount - discount);
    }

    // Increment usage count
    await pool.query(
      'UPDATE promo_codes SET used_count = used_count + 1 WHERE id = $1',
      [promo.id]
    );

    res.json({
      original_amount,
      discount,
      final_amount,
      promo_code: promo.code
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create promo code (admin only - simplified)
router.post('/create', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { code, discount_type, discount_value, valid_from, valid_until, max_uses } = req.body;

    const result = await pool.query(
      `INSERT INTO promo_codes (code, discount_type, discount_value, valid_from, valid_until, max_uses)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [code.toUpperCase(), discount_type, discount_value, valid_from, valid_until, max_uses]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;