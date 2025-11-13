CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    site_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    path TEXT,
    user_id VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
