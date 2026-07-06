-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    constituency_id UUID,
    participation_score INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CONSTITUENCIES
CREATE TABLE constituencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    district TEXT,
    state TEXT,
    mp_name TEXT
);

ALTER TABLE users
ADD CONSTRAINT fk_constituency
FOREIGN KEY (constituency_id)
REFERENCES constituencies(id);

-- SUGGESTIONS
CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    status TEXT DEFAULT 'Submitted',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI ANALYSIS
CREATE TABLE ai_analysis (
    suggestion_id UUID PRIMARY KEY REFERENCES suggestions(id) ON DELETE CASCADE,
    priority_score INT,
    urgency TEXT,
    sentiment TEXT,
    theme TEXT,
    confidence DECIMAL(5,2),
    impact_score INT,
    beneficiaries_estimate INT,
    duplicate_cluster_id UUID,
    recommendation_reason TEXT,
    ai_metadata JSONB
);

-- TIMELINE
CREATE TABLE suggestion_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- SUPPORTERS
CREATE TABLE suggestion_supporters (
    suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    supported_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (suggestion_id, user_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CONSTITUENCY INSIGHTS
CREATE TABLE constituency_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    constituency_id UUID REFERENCES constituencies(id) ON DELETE CASCADE,
    insight_type TEXT,
    data JSONB,
    generated_at TIMESTAMP DEFAULT NOW()
);

-- IMPACT
CREATE TABLE impact_metrics (
    suggestion_id UUID PRIMARY KEY REFERENCES suggestions(id) ON DELETE CASCADE,
    people_benefited INT,
    government_action TEXT,
    completion_percentage INT,
    evidence JSONB
);