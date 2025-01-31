-- Create battle_queue table
create table if not exists battle_queue (
  id bigint primary key generated always as identity,
  player_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(player_id)
);

-- Create active_battles table
create table if not exists active_battles (
  id bigint primary key generated always as identity,
  player1_id uuid references auth.users(id) not null,
  player2_id uuid references auth.users(id) not null,
  player1_card_id uuid references saved_cards(id) not null,
  player2_card_id uuid references saved_cards(id) not null,
  status text check (status in ('in_progress', 'completed')) not null default 'in_progress',
  winner_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create battle_rounds table
create table if not exists battle_rounds (
  id bigint primary key generated always as identity,
  battle_id bigint references active_battles(id) not null,
  round_number smallint not null check (round_number between 1 and 5),
  player1_move text check (player1_move in ('rock', 'paper', 'scissors')) not null,
  player2_move text check (player2_move in ('rock', 'paper', 'scissors')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(battle_id, round_number)
);

-- Create index for quick matchmaking queries
create index if not exists battle_queue_created_at_idx on battle_queue(created_at);

-- Add trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_active_battles_updated_at
    before update on active_battles
    for each row
    execute procedure update_updated_at_column();
