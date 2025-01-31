-- Remove is_computer_battle column since we're using player2_id = COMPUTER_USER_ID instead
ALTER TABLE active_battles DROP COLUMN is_computer_battle;
