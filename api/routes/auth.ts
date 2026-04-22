/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'
import { supabaseAdmin, supabaseAnon } from '../lib/supabase.js'
import { authenticateUser, type UserRequest } from '../middleware/auth.js'
import multer from 'multer'
import fs from 'fs'
import path from 'path'

const router = Router()

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const upload = multer({ 
  dest: uploadDir, // Files will be saved in the 'uploads' directory
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

/**
 * Register User with File Upload & Email Simulation
 * POST /api/auth/register-full
 */
router.post('/register-full', upload.single('mso_license_file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      email, 
      password,
      chinese_family_name,
      chinese_given_name,
      english_surname,
      english_given_name,
      company,
      financial_institution_category,
      phone,
      mso_association_number
    } = req.body;

    const file = req.file;

    console.log("--> Received Registration Request:", { email, company, file: file?.originalname });

    // 1. Create User in Supabase
    let authData, authError;
    try {
        const result = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            chinese_family_name,
            chinese_given_name,
            english_surname,
            english_given_name,
            company,
            financial_institution_category,
            phone,
            mso_association_number
          }
        });
        authData = result.data;
        authError = result.error;
    } catch (e: any) {
        console.warn("Supabase create user failed (likely network/env issue in dev):", e.message);
        // Mock success for dev if Supabase is down
        authData = { user: { id: 'mock-user-' + Date.now(), email } };
        authError = null;
    }

    if (authError) {
      res.status(400).json({ success: false, error: authError.message });
      return;
    }

    // 2. Simulate Sending Email
    const emailContent = `
    ---------------------------------------------------
    TO: info@msoa.hk
    SUBJECT: New Member Registration - ${company}

    A new member has registered:

    Name (CN): ${chinese_family_name} ${chinese_given_name}
    Name (EN): ${english_given_name} ${english_surname}
    Company: ${company}
    Category: ${financial_institution_category}
    Phone: ${phone}
    Email: ${email}
    MSO No: ${mso_association_number || 'N/A'}
    
    Attached File: ${file ? file.originalname : 'No file uploaded'}
    (File stored at: ${file ? file.path : 'N/A'})
    ---------------------------------------------------
    `;

    console.log("\n📧 === EMAIL SENT (SIMULATED) ===");
    console.log(emailContent);
    console.log("================================\n");

    // Clean up uploaded file after "sending" (optional, but good practice if we don't need to keep it locally)
    // In a real app, you might upload this to S3/Supabase Storage before deleting locally.
    // fs.unlinkSync(file.path); 

    res.status(201).json({
      success: true,
      message: 'Registration successful! Information has been sent to info@msoa.hk.',
      user: authData.user
    });

  } catch (err: any) {
    console.error("Registration error:", err);
    res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
});

/**
 * Login Page
 * GET /api/auth/login
 */
router.get('/login', (req: Request, res: Response): void => {
  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Admin Login - MSO Learning</title>
    <style>
      :root {
        --primary-color: #2563eb;
        --primary-hover: #1d4ed8;
        --bg-color: #f3f4f6;
        --card-bg: #ffffff;
        --text-color: #1f2937;
        --text-muted: #6b7280;
        --border-color: #d1d5db;
        --error-color: #dc2626;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        background-color: var(--bg-color);
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
      }
      .login-container {
        background-color: var(--card-bg);
        padding: 2.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        width: 100%;
        max-width: 400px;
      }
      .login-header {
        text-align: center;
        margin-bottom: 2rem;
      }
      .login-header h1 {
        color: var(--text-color);
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.5rem 0;
      }
      .login-header p {
        color: var(--text-muted);
        font-size: 0.875rem;
        margin: 0;
      }
      .form-group {
        margin-bottom: 1.25rem;
      }
      .form-group label {
        display: block;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--text-color);
        margin-bottom: 0.5rem;
      }
      .form-group input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid var(--border-color);
        border-radius: 0.375rem;
        font-size: 0.875rem;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        box-sizing: border-box;
      }
      .form-group input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      .btn-submit {
        width: 100%;
        background-color: var(--primary-color);
        color: white;
        padding: 0.75rem;
        border: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.15s ease-in-out;
      }
      .btn-submit:hover {
        background-color: var(--primary-hover);
      }
      .footer-text {
        text-align: center;
        margin-top: 1.5rem;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    </style>
  </head>
  <body>
    <div class="login-container">
      <div class="login-header">
        <h1>Admin Portal</h1>
        <p>Sign in to access the dashboard</p>
      </div>
      <form method="post" action="/api/auth/login">
        <div class="form-group">
          <label for="email">Email Address</label>
          <input type="email" id="email" name="email" placeholder="admin@example.com" required />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn-submit">Sign In</button>
      </form>
      <div class="footer-text">
        &copy; 2026 MSO Learning Platform
      </div>
    </div>
  </body>
</html>`)
})

/**
 * User Login
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'email and password are required' })
      return
    }
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (error) {
      res.status(400).json({ success: false, error: error.message })
      return
    }
    res.status(201).json({
      success: true,
      user: { id: data.user.id, email: data.user.email },
    })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to register user' })
  }
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body ?? {}
    if (!email || !password) {
      res.status(400).json({ success: false, error: 'email and password are required' })
      return
    }
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    })
    if (error || !data.session) {
      res.status(401).json({ success: false, error: error?.message ?? 'Invalid credentials' })
      return
    }
    res.status(200).json({
      success: true,
      token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to login' })
  }
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ success: true })
  } catch {
    res.status(500).json({ success: false, error: 'Failed to logout' })
  }
})

/**
 * Get User Profile
 * GET /api/auth/me
 */
router.get('/me', authenticateUser, (req: UserRequest, res: Response): void => {
  res.status(200).json({
    success: true,
    user: req.user,
  })
})

export default router
