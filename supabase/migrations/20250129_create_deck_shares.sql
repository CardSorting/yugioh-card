-- Create deck shares table
CREATE TABLE deck_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(deck_id, user_id)
);

-- Create deck share links table
CREATE TABLE deck_share_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX deck_shares_deck_id_idx ON deck_shares(deck_id);
CREATE INDEX deck_shares_user_id_idx ON deck_shares(user_id);
CREATE INDEX deck_share_links_deck_id_idx ON deck_share_links(deck_id);
CREATE INDEX deck_share_links_token_idx ON deck_share_links(token);

-- Add RLS policies
ALTER TABLE deck_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_share_links ENABLE ROW LEVEL SECURITY;

-- Deck owner can manage shares
CREATE POLICY "Deck owners can manage shares"
  ON deck_shares
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_shares.deck_id
      AND decks.user_id = auth.uid()
    )
  );

-- Users can view their shares
CREATE POLICY "Users can view their shares"
  ON deck_shares
  FOR SELECT
  USING (user_id = auth.uid());

-- Deck owner can manage share links
CREATE POLICY "Deck owners can manage share links"
  ON deck_share_links
  USING (
    EXISTS (
      SELECT 1 FROM decks
      WHERE decks.id = deck_share_links.deck_id
      AND decks.user_id = auth.uid()
    )
  );

-- Anyone can view share links (for validation)
CREATE POLICY "Anyone can view share links"
  ON deck_share_links
  FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_deck_shares_updated_at
  BEFORE UPDATE ON deck_shares
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_deck_share_links_updated_at
  BEFORE UPDATE ON deck_share_links
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Add function to check share permissions
CREATE OR REPLACE FUNCTION check_deck_share_permission(deck_id UUID, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  permission TEXT;
BEGIN
  -- First check if user owns the deck
  IF EXISTS (
    SELECT 1 FROM decks
    WHERE decks.id = deck_id
    AND decks.user_id = user_id
  ) THEN
    RETURN 'owner';
  END IF;

  -- Then check for share permission
  SELECT deck_shares.permission INTO permission
  FROM deck_shares
  WHERE deck_shares.deck_id = deck_id
  AND deck_shares.user_id = user_id;

  RETURN permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to validate share link
CREATE OR REPLACE FUNCTION validate_share_link(share_token TEXT)
RETURNS UUID AS $$
DECLARE
  deck_id UUID;
BEGIN
  SELECT deck_share_links.deck_id INTO deck_id
  FROM deck_share_links
  WHERE deck_share_links.token = share_token
  AND (deck_share_links.expires_at IS NULL OR deck_share_links.expires_at > timezone('utc'::text, now()));

  RETURN deck_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE deck_shares TO authenticated;
GRANT ALL ON TABLE deck_share_links TO authenticated;
GRANT EXECUTE ON FUNCTION check_deck_share_permission TO authenticated;
GRANT EXECUTE ON FUNCTION validate_share_link TO authenticated;
