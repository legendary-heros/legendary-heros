-- Create enum types
CREATE TYPE user_status AS ENUM ('allow', 'waiting', 'block');
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'leader', 'member');

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  slackname TEXT,
  dotaname TEXT,
  status user_status DEFAULT 'waiting',
  role user_role DEFAULT 'member',
  score TEXT DEFAULT '0',
  vote_count TEXT DEFAULT '0',
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Create votes table to track who voted for whom
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  voted_for_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voter_id, voted_for_id) -- Ensure one user can only vote for another user once
);

-- Create indexes for faster queries
CREATE INDEX idx_votes_voter_id ON votes(voter_id);
CREATE INDEX idx_votes_voted_for_id ON votes(voted_for_id);
CREATE INDEX idx_votes_voter_voted_for ON votes(voter_id, voted_for_id);

-- Add comment
COMMENT ON TABLE votes IS 'Tracks user votes to prevent duplicate voting';
COMMENT ON COLUMN votes.voter_id IS 'ID of the user who cast the vote';
COMMENT ON COLUMN votes.voted_for_id IS 'ID of the user who received the vote';

