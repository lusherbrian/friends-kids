-- Database Updates for Quick Wins
-- Run this in your Supabase SQL Editor to add new columns

-- Add tracking columns to kids table
ALTER TABLE kids
ADD COLUMN IF NOT EXISTS rsvp_status TEXT DEFAULT 'n/a' CHECK (rsvp_status IN ('yes', 'no', 'n/a')),
ADD COLUMN IF NOT EXISTS gift_bought TEXT DEFAULT 'n/a' CHECK (gift_bought IN ('yes', 'no', 'n/a')),
ADD COLUMN IF NOT EXISTS texted_hb BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gift_notes TEXT,
ADD COLUMN IF NOT EXISTS age_at_next_birthday INTEGER;

-- Add party details columns to parties table
ALTER TABLE parties
ADD COLUMN IF NOT EXISTS party_time TIME,
ADD COLUMN IF NOT EXISTS theme TEXT,
ADD COLUMN IF NOT EXISTS plus_one_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS directions TEXT;

-- Create function to calculate age at next birthday
CREATE OR REPLACE FUNCTION calculate_age_at_next_birthday(birth_date DATE)
RETURNS INTEGER AS $$
DECLARE
    next_birthday DATE;
    age INTEGER;
BEGIN
    -- Get the next birthday (this year or next year)
    next_birthday := make_date(
        CASE 
            WHEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER, 
                          EXTRACT(MONTH FROM birth_date)::INTEGER, 
                          EXTRACT(DAY FROM birth_date)::INTEGER) >= CURRENT_DATE
            THEN EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
            ELSE EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1
        END,
        EXTRACT(MONTH FROM birth_date)::INTEGER,
        EXTRACT(DAY FROM birth_date)::INTEGER
    );
    
    -- Calculate age at next birthday
    age := EXTRACT(YEAR FROM next_birthday)::INTEGER - EXTRACT(YEAR FROM birth_date)::INTEGER;
    
    RETURN age;
END;
$$ LANGUAGE plpgsql;

-- Update existing kids records with calculated ages
UPDATE kids
SET age_at_next_birthday = calculate_age_at_next_birthday(birthdate);

-- Create trigger to auto-calculate age when birthdate changes
CREATE OR REPLACE FUNCTION update_age_at_next_birthday()
RETURNS TRIGGER AS $$
BEGIN
    NEW.age_at_next_birthday := calculate_age_at_next_birthday(NEW.birthdate);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_age
    BEFORE INSERT OR UPDATE OF birthdate ON kids
    FOR EACH ROW
    EXECUTE FUNCTION update_age_at_next_birthday();

-- Add comments for documentation
COMMENT ON COLUMN kids.rsvp_status IS 'RSVP status for birthday party: yes, no, or n/a';
COMMENT ON COLUMN kids.gift_bought IS 'Whether gift has been purchased: yes, no, or n/a';
COMMENT ON COLUMN kids.texted_hb IS 'Whether happy birthday text has been sent';
COMMENT ON COLUMN kids.gift_notes IS 'Notes about gift ideas, preferences, past gifts';
COMMENT ON COLUMN kids.age_at_next_birthday IS 'Calculated age at next birthday (auto-updated)';
