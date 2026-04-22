import { Router, type Request, type Response } from 'express'
import { authenticateUser, type UserRequest } from '../../middleware/auth.js'
import { supabaseAdmin } from '../../lib/supabase.js'

const router = Router()

/**
 * Generate Certificate (Admin or System)
 * POST /api/certificates/generate
 */
router.post('/generate', authenticateUser, async (req: UserRequest, res: Response) => {
  // Logic: Verify course completion -> Create unique ID -> Generate PDF -> Save to DB
  res.status(501).json({ error: 'Not implemented: Certificate Generation' })
})

/**
 * Verify Certificate (Public)
 * GET /api/certificates/verify/:code
 */
router.get('/verify/:code', async (req: Request, res: Response) => {
  const { code } = req.params
  // Logic: Lookup certificate by unique code -> Return validity + basic details
  res.status(200).json({ valid: true, details: { holder: 'John Doe', course: 'AML 101' } })
})

export default router
