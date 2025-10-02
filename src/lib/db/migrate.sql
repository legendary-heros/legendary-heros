-- Create enum types
CREATE TYPE user_status AS ENUM ('allow', 'waiting', 'block');
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'member');

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



-- Create enum types for teams
CREATE TYPE team_status AS ENUM ('waiting', 'approved', 'blocked');
CREATE TYPE team_member_role AS ENUM ('leader', 'Orb Hero', 'King Creep', 'Bird Buyer', 'Bounty');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE join_request_status AS ENUM ('pending', 'approved', 'rejected');

-- Create teams table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  mark_url TEXT,
  ad_url TEXT,
  bio TEXT,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status team_status DEFAULT 'waiting',
  score TEXT DEFAULT '0',
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role team_member_role DEFAULT 'Bounty',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create team_invitations table
CREATE TABLE team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status invitation_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, invitee_id, status)
);

-- Create team_join_requests table
CREATE TABLE team_join_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status join_request_status DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id, status)
);

-- Create indexes for faster queries
CREATE INDEX idx_teams_leader_id ON teams(leader_id);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_score ON teams(score);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_user ON team_members(team_id, user_id);

CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_invitee_id ON team_invitations(invitee_id);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);

CREATE INDEX idx_team_join_requests_team_id ON team_join_requests(team_id);
CREATE INDEX idx_team_join_requests_user_id ON team_join_requests(user_id);
CREATE INDEX idx_team_join_requests_status ON team_join_requests(status);

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_invitations_updated_at BEFORE UPDATE ON team_invitations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_join_requests_updated_at BEFORE UPDATE ON team_join_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update team score when member joins
CREATE OR REPLACE FUNCTION update_team_score_on_member_join()
RETURNS TRIGGER AS $$
BEGIN
  -- Add 10% of member's score to team score
  UPDATE teams
  SET score = (CAST(score AS NUMERIC) + (CAST((SELECT score FROM users WHERE id = NEW.user_id) AS NUMERIC) * 0.1))::TEXT,
      member_count = member_count + 1
  WHERE id = NEW.team_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update team score when member leaves
CREATE OR REPLACE FUNCTION update_team_score_on_member_leave()
RETURNS TRIGGER AS $$
BEGIN
  -- Subtract 10% of member's score from team score
  UPDATE teams
  SET score = GREATEST((CAST(score AS NUMERIC) - (CAST((SELECT score FROM users WHERE id = OLD.user_id) AS NUMERIC) * 0.1))::TEXT, '0'),
      member_count = GREATEST(member_count - 1, 0)
  WHERE id = OLD.team_id;
  RETURN OLD;
END;
$$ language 'plpgsql';

-- Create triggers for team score updates
CREATE TRIGGER team_score_on_member_join
AFTER INSERT ON team_members
FOR EACH ROW EXECUTE FUNCTION update_team_score_on_member_join();

CREATE TRIGGER team_score_on_member_leave
AFTER DELETE ON team_members
FOR EACH ROW EXECUTE FUNCTION update_team_score_on_member_leave();

-- Add comments
COMMENT ON TABLE teams IS 'Stores team information';
COMMENT ON TABLE team_members IS 'Tracks team memberships';
COMMENT ON TABLE team_invitations IS 'Tracks team invitations sent to users';
COMMENT ON TABLE team_join_requests IS 'Tracks user requests to join teams';



