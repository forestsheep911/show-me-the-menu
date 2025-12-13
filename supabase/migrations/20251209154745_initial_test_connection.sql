-- 创建测试连接表
CREATE TABLE IF NOT EXISTS test_connection (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS（Row Level Security）
ALTER TABLE test_connection ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户读取
CREATE POLICY "Allow anonymous read" ON test_connection 
  FOR SELECT USING (true);
