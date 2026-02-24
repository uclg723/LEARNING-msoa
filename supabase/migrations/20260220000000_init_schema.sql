-- Create users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    chinese_family_name VARCHAR(100),
    chinese_given_name VARCHAR(100),
    english_surname VARCHAR(100),
    english_given_name VARCHAR(100),
    company VARCHAR(255),
    financial_institution_category VARCHAR(100),
    phone VARCHAR(50),
    mso_association_number VARCHAR(100),
    is_disabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    price_cents INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapters table
CREATE TABLE public.chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER NOT NULL,
    video_url VARCHAR(500),
    duration_minutes INTEGER,
    preview_seconds INTEGER DEFAULT 0
);

-- Questions table (for in-video questions)
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    question_type VARCHAR(50) NOT NULL, -- 'short_answer', 'mcq'
    question_text TEXT NOT NULL,
    options JSONB, -- For MCQ options
    correct_answer TEXT,
    explanation TEXT,
    video_timestamp_seconds INTEGER NOT NULL,
    order_index INTEGER
);

-- Purchases table with 90-day expiry
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL CHECK (product_type IN ('course', 'practice', 'registration')),
    price_cents INTEGER NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '90 days',
    stripe_transaction_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active'
);

-- Course progress tracking
CREATE TABLE public.course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    time_spent_seconds INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    question_answers JSONB DEFAULT '[]'::jsonb,
    UNIQUE(user_id, course_id, chapter_id)
);

-- Certificates table
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
    certificate_number VARCHAR(50) UNIQUE NOT NULL,
    total_time_seconds INTEGER NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_url VARCHAR(500),
    verification_url VARCHAR(500),
    is_cancelled BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all users" ON public.users FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role'); -- Simplification for admin

-- Courses (Publicly viewable if active)
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);

-- Chapters (Viewable if course is purchased OR for preview)
-- This is complex, simplifying for now: Public view of metadata, but video URL might be protected via Storage RLS or signed URLs.
CREATE POLICY "Anyone can view chapters" ON public.chapters FOR SELECT USING (true); 

-- Purchases
CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id);

-- Progress
CREATE POLICY "Users can view their own progress" ON public.course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress update" ON public.course_progress FOR UPDATE USING (auth.uid() = user_id);

-- Certificates
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions to authenticated and anon roles (important for Supabase)
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT SELECT ON public.chapters TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.course_progress TO authenticated;
GRANT SELECT, INSERT ON public.purchases TO authenticated;
GRANT SELECT ON public.certificates TO authenticated;
