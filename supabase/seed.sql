-- Seed 数据：用于测试和开发环境的初始数据

-- 测试连接数据
INSERT INTO test_connection (message) VALUES ('Hello from Supabase!')
ON CONFLICT DO NOTHING;
