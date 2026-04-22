import { Router, type Request, type Response } from 'express'
import { supabaseAnon, supabaseAdmin } from '../lib/supabase.js'
import { authenticateUser, type UserRequest } from '../middleware/auth.js'

const router = Router()

/**
 * List Courses
 * GET /api/courses
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabaseAnon
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) {
      res.status(500).json({ success: false, error: error.message })
      return
    }

    // Check if the request accepts HTML
    if (req.accepts('html')) {
      const coursesList = (data || []).map((course: any) => `
        <div class="course-card">
          <div class="course-image">
            ${course.thumbnail_url 
              ? `<img src="${course.thumbnail_url}" alt="${course.title_en}" />` 
              : '<div class="placeholder-image">Course</div>'}
          </div>
          <div class="course-content">
            <h2>${course.title_en}</h2>
            <p>${course.description_en || ''}</p>
            <div class="course-meta">
              <span class="price">HK$${course.price_member}</span>
              <span class="duration">${course.duration_hours} hours</span>
            </div>
            <a href="#" class="btn">View Details</a>
          </div>
        </div>
      `).join('')

      res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Courses - MSO Learning</title>
    <style>
      :root {
        --primary-color: #2563eb;
        --bg-color: #f3f4f6;
        --card-bg: #ffffff;
        --text-color: #1f2937;
        --text-muted: #6b7280;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background-color: var(--bg-color);
        margin: 0;
        padding: 2rem;
        color: var(--text-color);
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
      }
      h1 {
        text-align: center;
        margin-bottom: 2rem;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
      }
      .course-card {
        background: var(--card-bg);
        border-radius: 0.75rem;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
        display: flex;
        flex-direction: column;
      }
      .course-card:hover {
        transform: translateY(-4px);
      }
      .course-image {
        height: 200px;
        background: #e5e7eb;
        overflow: hidden;
      }
      .course-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .placeholder-image {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9ca3af;
        font-size: 1.5rem;
        font-weight: bold;
      }
      .course-content {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .course-content h2 {
        font-size: 1.25rem;
        margin: 0 0 0.5rem 0;
        line-height: 1.4;
      }
      .course-content p {
        color: var(--text-muted);
        font-size: 0.875rem;
        line-height: 1.5;
        margin-bottom: 1rem;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .course-meta {
        margin-top: auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        font-size: 0.875rem;
      }
      .price {
        font-weight: bold;
        color: var(--primary-color);
      }
      .btn {
        display: block;
        text-align: center;
        background: var(--primary-color);
        color: white;
        text-decoration: none;
        padding: 0.75rem;
        border-radius: 0.375rem;
        font-weight: 500;
        transition: background-color 0.2s;
      }
      .btn:hover {
        background-color: #1d4ed8;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Available Courses</h1>
      <div class="grid">
        ${coursesList}
      </div>
    </div>
  </body>
</html>`)
      return
    }

    res.status(200).json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch courses' })
  }
})

/**
 * Get Course Detail
 * GET /api/courses/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { data, error } = await supabaseAnon
      .from('courses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      res.status(404).json({ success: false, error: 'Course not found' })
      return
    }
    res.status(200).json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch course' })
  }
})

/**
 * Check Enrollment
 * GET /api/courses/:id/enrollment
 */
router.get('/:id/enrollment', authenticateUser, async (req: UserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    // Use Admin to bypass RLS for checking specific user enrollment
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('course_id', id)
      .eq('user_id', req.user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      res.status(500).json({ success: false, error: error.message })
      return
    }

    res.status(200).json({ success: true, enrolled: !!data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to check enrollment' })
  }
})

/**
 * Enroll in Course
 * POST /api/courses/:id/enroll
 */
router.post('/:id/enroll', authenticateUser, async (req: UserRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    // Check if already enrolled (Admin client)
    const { data: existing } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('course_id', id)
      .eq('user_id', req.user.id)
      .single()
      
    if (existing) {
      res.status(400).json({ success: false, error: 'Already enrolled' })
      return
    }

    // Enroll
    const { error } = await supabaseAdmin
      .from('enrollments')
      .insert({
        course_id: id,
        user_id: req.user.id,
        status: 'active',
        enrolled_at: new Date().toISOString()
      })

    if (error) {
      res.status(500).json({ success: false, error: error.message })
      return
    }

    res.status(200).json({ success: true })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to enroll' })
  }
})

/**
 * Create Course (Protected)
 * POST /api/courses
 */
router.post('/', authenticateUser, async (req: UserRequest, res: Response): Promise<void> => {
  try {
    const { 
      title_en, 
      description_en, 
      thumbnail_url,
      price_member, 
      price_non_member, 
      duration_hours, 
      level 
    } = req.body

    // Using supabaseAdmin to bypass RLS for creation if needed, 
    // or assume Authenticated user has rights.
    const { data, error } = await supabaseAdmin
      .from('courses')
      .insert({
        title_en,
        description_en,
        thumbnail_url,
        price_member,
        price_non_member,
        duration_hours,
        level,
        status: 'published'
      })
      .select()
      .single()

    if (error) {
      res.status(400).json({ success: false, error: error.message })
      return
    }
    res.status(201).json({ success: true, data })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create course' })
  }
})

export default router
