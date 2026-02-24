-- Add question_answers to lesson_progress to track in-video responses
ALTER TABLE public.lesson_progress 
ADD COLUMN question_answers JSONB DEFAULT '[]'::jsonb;

-- Comment
COMMENT ON COLUMN public.lesson_progress.question_answers IS 'Array of answered question IDs and their responses';
