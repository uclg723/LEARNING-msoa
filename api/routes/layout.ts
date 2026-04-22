import { Router, type Request, type Response } from 'express'
import { supabaseAdmin, supabaseAnon } from '../lib/supabase.js'
import { authenticateUser, type UserRequest } from '../middleware/auth.js'

const router = Router()

/**
 * Get Page Layout
 * GET /api/layout/:page
 */
router.get('/:page', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page } = req.params
    // Fetch layout config from 'page_layouts' table
    // If table doesn't exist, we return default layout
    const { data, error } = await supabaseAnon
      .from('page_layouts')
      .select('*')
      .eq('page_key', page)
      .single()

    if (error || !data) {
      // Return default layout if not found
      res.status(200).json({
        success: true,
        layout: getDefaultLayout(page)
      })
      return
    }

    res.status(200).json({ success: true, layout: data.config })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch layout' })
  }
})

/**
 * Update Page Layout (Admin only)
 * PUT /api/layout/:page
 */
router.put('/:page', authenticateUser, async (req: UserRequest, res: Response): Promise<void> => {
  try {
    const { page } = req.params
    const { config } = req.body

    // Upsert layout config
    const { data, error } = await supabaseAdmin
      .from('page_layouts')
      .upsert({
        page_key: page,
        config,
        updated_at: new Date().toISOString(),
        updated_by: req.user.id
      }, { onConflict: 'page_key' })
      .select()
      .single()

    if (error) {
      res.status(500).json({ success: false, error: error.message })
      return
    }

    res.status(200).json({ success: true, layout: data.config })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update layout' })
  }
})

function getDefaultLayout(page: string) {
  // Default configurations for different pages
  if (page === 'home') {
    return {
      hero: {
        title: "Professional Learning Platform",
        subtitle: "Master your skills with our comprehensive courses and practice exams.",
        showButtons: true,
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      },
      features: {
        show: true,
        items: [
          { icon: "PlayCircle", title: "Online Courses", desc: "High-quality video lessons" },
          { icon: "Shield", title: "License Practice", desc: "Comprehensive question bank" },
          { icon: "Award", title: "Certification", desc: "Verifiable certificates" }
        ]
      }
    }
  }
  return {}
}

export default router
