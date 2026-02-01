-- Notes table for coaching notes, match notes, practice plans, etc.
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL CHECK (note_type IN (
    'practice', 'match', 'pre_match', 'post_match',
    'practice_plan', 'film_review', 'general'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'specific')),
  player_mentions INTEGER[] DEFAULT '{}',
  key_points TEXT[] DEFAULT '{}',
  ai_raw_output JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  fts TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(content, '')), 'B')
  ) STORED
);

CREATE INDEX idx_notes_author ON notes(author_id);
CREATE INDEX idx_notes_type ON notes(note_type);
CREATE INDEX idx_notes_event ON notes(event_id);
CREATE INDEX idx_notes_created ON notes(created_at DESC);
CREATE INDEX idx_notes_mentions ON notes USING GIN(player_mentions);
CREATE INDEX idx_notes_fts ON notes USING GIN(fts);

-- Note shares for specific visibility
CREATE TABLE note_shares (
  note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, player_id)
);

CREATE INDEX idx_note_shares_player ON note_shares(player_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at();

-- RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_shares ENABLE ROW LEVEL SECURITY;

-- Authors: full CRUD on own notes
CREATE POLICY "Users can create notes"
  ON notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own notes"
  ON notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own notes"
  ON notes FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

-- Read: authors see own, coaches/admins see all, players see team + shared
CREATE POLICY "Users can read notes"
  ON notes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = author_id
    OR visibility = 'team'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('coach', 'admin')
    )
    OR (
      visibility = 'specific'
      AND EXISTS (
        SELECT 1 FROM note_shares ns
        JOIN profiles p ON p.id = auth.uid()
        WHERE ns.note_id = notes.id
        AND ns.player_id = p.player_id
      )
    )
  );

-- Allow public (unauthenticated) read for team-visible notes
CREATE POLICY "Public can read team notes"
  ON notes FOR SELECT
  TO anon
  USING (visibility = 'team');

-- Note shares: authors manage shares for their notes
CREATE POLICY "Authors can manage note shares"
  ON note_shares FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM notes
      WHERE notes.id = note_shares.note_id
      AND notes.author_id = auth.uid()
    )
  );

-- Players can read their shares
CREATE POLICY "Players can read their shares"
  ON note_shares FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.player_id = note_shares.player_id
    )
  );
