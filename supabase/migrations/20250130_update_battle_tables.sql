-- Make card_id fields nullable
alter table active_battles
  alter column player1_card_id drop not null,
  alter column player2_card_id drop not null;

-- Add check constraint to ensure cards are required only for human battles
create or replace function public.is_computer_player(player_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = player_id and is_computer = true
  );
end;
$$ language plpgsql security definer;

-- Add constraint that requires card_ids for human players
alter table active_battles
  add constraint human_players_require_cards check (
    (is_computer_player(player1_id) or player1_card_id is not null) and
    (is_computer_player(player2_id) or player2_card_id is not null)
  );
