import { Router, type Request, type Response } from 'express'
import { authenticateUser, type UserRequest } from '../../middleware/auth.js'
import { supabaseAdmin } from '../../lib/supabase.js'

const router = Router()

/**
 * Create Payment Intent (Stripe)
 * POST /api/payments/create-intent
 */
router.post('/create-intent', authenticateUser, async (req: UserRequest, res: Response) => {
  // Logic: Calculate price -> Call Stripe API -> Return client_secret
  res.status(501).json({ error: 'Not implemented: Stripe Payment Intent' })
})

/**
 * Handle Webhook (Stripe)
 * POST /api/payments/webhook
 */
router.post('/webhook', async (req: Request, res: Response) => {
  // Logic: Verify signature -> Update DB status -> Grant access -> Email receipt
  res.status(200).send('Webhook received')
})

export default router
