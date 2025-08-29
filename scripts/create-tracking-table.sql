-- Create tracking_logs table for analytics
CREATE TABLE IF NOT EXISTS tracking_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  session_id VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  platform VARCHAR(50) DEFAULT 'meta',
  status VARCHAR(20) DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tracking_logs_created_at ON tracking_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_logs_event_name ON tracking_logs(event_name);
CREATE INDEX IF NOT EXISTS idx_tracking_logs_session_id ON tracking_logs(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tracking_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for security)
CREATE POLICY "Allow all operations on tracking_logs" ON tracking_logs
  FOR ALL USING (true);
