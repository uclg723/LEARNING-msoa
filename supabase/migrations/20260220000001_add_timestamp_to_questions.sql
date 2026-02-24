-- Add video_timestamp_seconds to quiz_questions for in-video gating
ALTER TABLE public.quiz_questions 
ADD COLUMN video_timestamp_seconds INTEGER DEFAULT 0;

-- Comment to explain usage
COMMENT ON COLUMN public.quiz_questions.video_timestamp_seconds IS 'Timestamp in seconds when the video should pause for this question';
