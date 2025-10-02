-- Create analysis_history table to store leaf disease detection results
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  result TEXT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);

-- Create index for faster queries by date
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON analysis_history(created_at DESC);

-- Enable Row Level Security
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own analysis history
CREATE POLICY "Users can view their own analysis history" ON analysis_history
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own analysis history
CREATE POLICY "Users can insert their own analysis history" ON analysis_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own analysis history
CREATE POLICY "Users can update their own analysis history" ON analysis_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own analysis history
CREATE POLICY "Users can delete their own analysis history" ON analysis_history
  FOR DELETE USING (auth.uid() = user_id);
