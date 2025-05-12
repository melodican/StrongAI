/*
  # Create Messages Table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `content` (text, message content)
      - `is_from_user` (boolean, indicates if message is from user or AI)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz, when message was created)
  2. Security
    - Enable RLS on `messages` table
    - Add policy for authenticated users to read their own messages
    - Add policy for authenticated users to insert their own messages
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  is_from_user boolean NOT NULL DEFAULT true,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own messages
CREATE POLICY "Users can read own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to insert their own messages
CREATE POLICY "Users can insert own messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);