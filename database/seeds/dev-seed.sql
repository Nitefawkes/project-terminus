-- Development seed data for testing
-- Password for all test users: "password123"

-- Insert test users (password hash for "password123")
INSERT INTO users (id, email, password_hash, name, is_active, is_verified)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@terminus.dev', '$2b$10$rJGheFKUgXnL8/J6kQZ8E.1YYxZ4XQ5oX1nKJ4qR7y/xvLFN7qV8m', 'Admin User', true, true),
    ('550e8400-e29b-41d4-a716-446655440002', 'user@terminus.dev', '$2b$10$rJGheFKUgXnL8/J6kQZ8E.1YYxZ4XQ5oX1nKJ4qR7y/xvLFN7qV8m', 'Test User', true, true),
    ('550e8400-e29b-41d4-a716-446655440003', 'demo@terminus.dev', '$2b$10$rJGheFKUgXnL8/J6kQZ8E.1YYxZ4XQ5oX1nKJ4qR7y/xvLFN7qV8m', 'Demo User', true, false)
ON CONFLICT (id) DO NOTHING;

-- Insert user preferences
INSERT INTO user_preferences (user_id, map_style, default_zoom, default_center, enabled_layers)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'dark', 3.0, '{"lat": 40.7128, "lng": -74.0060}'::jsonb, '["terminator", "iss", "aurora"]'::jsonb),
    ('550e8400-e29b-41d4-a716-446655440002', 'dark', 2.0, '{"lat": 0, "lng": 0}'::jsonb, '["terminator"]'::jsonb),
    ('550e8400-e29b-41d4-a716-446655440003', 'dark', 2.5, '{"lat": 51.5074, "lng": -0.1278}'::jsonb, '["terminator", "iss"]'::jsonb)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample pins
INSERT INTO pins (user_id, name, description, latitude, longitude)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'New York City', 'Home base', 40.7128, -74.0060),
    ('550e8400-e29b-41d4-a716-446655440001', 'Tokyo', 'Regional office', 35.6762, 139.6503),
    ('550e8400-e29b-41d4-a716-446655440001', 'London', 'European HQ', 51.5074, -0.1278),
    ('550e8400-e29b-41d4-a716-446655440002', 'San Francisco', 'Tech hub', 37.7749, -122.4194),
    ('550e8400-e29b-41d4-a716-446655440002', 'Sydney', 'Australia office', -33.8688, 151.2093),
    ('550e8400-e29b-41d4-a716-446655440003', 'Paris', 'Cultural center', 48.8566, 2.3522)
ON CONFLICT DO NOTHING;

-- Log seed completion
DO $$
BEGIN
    RAISE NOTICE 'Development seed data loaded successfully';
    RAISE NOTICE 'Test users created:';
    RAISE NOTICE '  - admin@terminus.dev (password: password123)';
    RAISE NOTICE '  - user@terminus.dev (password: password123)';
    RAISE NOTICE '  - demo@terminus.dev (password: password123)';
END $$;

