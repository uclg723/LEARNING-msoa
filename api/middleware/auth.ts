import { type Request, type Response, type NextFunction } from 'express'
import { supabaseAnon } from '../lib/supabase.js'

export interface UserRequest extends Request {
  user?: any
}

export const authenticateUser = async (
  req: UserRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).json({ success: false, error: 'No authorization header' })
      return
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      res.status(401).json({ success: false, error: 'No token provided' })
      return
    }

    // --- MOCK ADMIN BYPASS FOR DEVELOPMENT ---
    // This allows the Admin Dashboard to work without implementing full Supabase Auth login yet.
    if (token === 'mock-admin-token') {
      req.user = { id: 'mock-admin-id', email: 'admin@example.com', role: 'admin' }
      next()
      return
    }
    // -----------------------------------------

    let user;
    let error;

    try {
      const result = await supabaseAnon.auth.getUser(token)
      user = result.data.user
      error = result.error
    } catch (err: any) {
      console.error("Auth middleware network error:", err.message)
      // If network fails, we can't verify the token.
      res.status(401).json({ success: false, error: 'Authentication service unavailable' })
      return
    }

    if (error || !user) {
      res.status(401).json({ success: false, error: 'Invalid or expired token' })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to authenticate user' })
  }
}
