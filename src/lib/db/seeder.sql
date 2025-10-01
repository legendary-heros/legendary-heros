-- Insert superadmin user
INSERT INTO users (email, password, username, slackname, dotaname, status, role, score, vote_count, bio)
VALUES (
  'denisredzepovic72@gmail.com',
  '$2b$10$JnxA4EZQE7vE5Lf.KZ/Lzu7RLDiEJ1CGz6ZvYSGmJnPASy0aOTkBG', -- replace with a properly hashed password
  'TobiSmile',
  '@TobiSmile',
  'TobiSmile',
  'allow',
  'superadmin',
  '0',
  '0',
  'This is the default superadmin account.'
);