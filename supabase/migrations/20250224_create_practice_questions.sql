-- Create table for practice questions
CREATE TABLE IF NOT EXISTS public.practice_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_option_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    is_free BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public/Authenticated users can read (SELECT) questions
-- Note: We handle the hiding of answers in the API layer, but RLS could also restrict columns if we split tables.
-- For simplicity, we allow read access to the row, and the API filters fields.
CREATE POLICY "Enable read access for all users" ON public.practice_questions
    FOR SELECT USING (true);

-- 2. Only Admins can Insert/Update/Delete
-- Assuming 'admin' role check or service_role usage. 
-- For now, we'll allow service_role (which our backend uses for Admin ops) to do everything.
-- If you have an 'admin' role in your users table, you would add:
-- USING (auth.uid() IN (SELECT id FROM public.users WHERE role = 'admin'))

CREATE POLICY "Enable all access for service role" ON public.practice_questions
    FOR ALL USING (auth.role() = 'service_role');
