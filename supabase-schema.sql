-- Friends Kids Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Friends table
CREATE TABLE friends (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    reminder_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kids table
CREATE TABLE kids (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    birthdate DATE NOT NULL,
    reminder_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gifts table
CREATE TABLE gifts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    purchased BOOLEAN DEFAULT false,
    purchase_date DATE,
    price DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parties table
CREATE TABLE parties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    kid_id UUID NOT NULL REFERENCES kids(id) ON DELETE CASCADE,
    party_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    notes TEXT,
    gift_purchased BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pregnancies table
CREATE TABLE pregnancies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    notes TEXT,
    baby_born BOOLEAN DEFAULT false,
    birth_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_kids_friend_id ON kids(friend_id);
CREATE INDEX idx_gifts_kid_id ON gifts(kid_id);
CREATE INDEX idx_parties_kid_id ON parties(kid_id);
CREATE INDEX idx_pregnancies_friend_id ON pregnancies(friend_id);
CREATE INDEX idx_kids_birthdate ON kids(birthdate);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancies ENABLE ROW LEVEL SECURITY;

-- Friends policies
CREATE POLICY "Users can view their own friends"
    ON friends FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own friends"
    ON friends FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own friends"
    ON friends FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own friends"
    ON friends FOR DELETE
    USING (auth.uid() = user_id);

-- Kids policies (through friends relationship)
CREATE POLICY "Users can view kids of their friends"
    ON kids FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = kids.friend_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert kids for their friends"
    ON kids FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = kids.friend_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update kids of their friends"
    ON kids FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = kids.friend_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete kids of their friends"
    ON kids FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = kids.friend_id
            AND friends.user_id = auth.uid()
        )
    );

-- Gifts policies
CREATE POLICY "Users can view gifts for kids of their friends"
    ON gifts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM kids
            JOIN friends ON friends.id = kids.friend_id
            WHERE kids.id = gifts.kid_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert gifts for kids of their friends"
    ON gifts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM kids
            JOIN friends ON friends.id = kids.friend_id
            WHERE kids.id = gifts.kid_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update gifts for kids of their friends"
    ON gifts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM kids
            JOIN friends ON friends.id = kids.friend_id
            WHERE kids.id = gifts.kid_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete gifts for kids of their friends"
    ON gifts FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM kids
            JOIN friends ON friends.id = kids.friend_id
            WHERE kids.id = gifts.kid_id
            AND friends.user_id = auth.uid()
        )
    );

-- Parties policies
CREATE POLICY "Users can view parties for kids of their friends"
    ON parties FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM kids
            JOIN friends ON friends.id = kids.friend_id
            WHERE kids.id = parties.kid_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert parties for kids of their friends"
    ON parties FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM kids
            JOIN friends ON friends.id = kids.friend_id
            WHERE kids.id = parties.kid_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update parties for kids of their friends"
    ON parties FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM kids
            JOIN friends ON friends.id = kids.friend_id
            WHERE kids.id = parties.kid_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete parties for kids of their friends"
    ON parties FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM kids
            JOIN friends ON friends.id = kids.friend_id
            WHERE kids.id = parties.kid_id
            AND friends.user_id = auth.uid()
        )
    );

-- Pregnancies policies
CREATE POLICY "Users can view pregnancies of their friends"
    ON pregnancies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = pregnancies.friend_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert pregnancies for their friends"
    ON pregnancies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = pregnancies.friend_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update pregnancies of their friends"
    ON pregnancies FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = pregnancies.friend_id
            AND friends.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete pregnancies of their friends"
    ON pregnancies FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM friends
            WHERE friends.id = pregnancies.friend_id
            AND friends.user_id = auth.uid()
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_friends_updated_at BEFORE UPDATE ON friends
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kids_updated_at BEFORE UPDATE ON kids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gifts_updated_at BEFORE UPDATE ON gifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parties_updated_at BEFORE UPDATE ON parties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pregnancies_updated_at BEFORE UPDATE ON pregnancies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
