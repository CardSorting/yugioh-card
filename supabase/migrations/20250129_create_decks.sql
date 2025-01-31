-- Create decks table
create table public.decks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create deck_cards junction table
create table public.deck_cards (
  id uuid default uuid_generate_v4() primary key,
  deck_id uuid references public.decks(id) on delete cascade not null,
  card_id uuid references public.saved_cards(id) on delete cascade not null,
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(deck_id, card_id)
);

-- Enable RLS
alter table public.decks enable row level security;
alter table public.deck_cards enable row level security;

-- Create policies for decks
create policy "Users can view their own decks" on public.decks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own decks" on public.decks
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own decks" on public.decks
  for update using (auth.uid() = user_id);

create policy "Users can delete their own decks" on public.decks
  for delete using (auth.uid() = user_id);

-- Create policies for deck_cards
create policy "Users can view their deck cards" on public.deck_cards
  for select using (
    exists (
      select 1 from public.decks
      where id = deck_cards.deck_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert their deck cards" on public.deck_cards
  for insert with check (
    exists (
      select 1 from public.decks
      where id = deck_cards.deck_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update their deck cards" on public.deck_cards
  for update using (
    exists (
      select 1 from public.decks
      where id = deck_cards.deck_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete their deck cards" on public.deck_cards
  for delete using (
    exists (
      select 1 from public.decks
      where id = deck_cards.deck_id
      and user_id = auth.uid()
    )
  );

-- Create updated_at trigger for decks
create trigger handle_decks_updated_at
  before update on public.decks
  for each row
  execute function public.handle_updated_at();
