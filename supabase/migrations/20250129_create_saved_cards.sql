-- Create saved_cards table
create table public.saved_cards (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  card_data jsonb not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.saved_cards enable row level security;

-- Create policies
create policy "Users can view their own cards" on public.saved_cards
  for select using (auth.uid() = user_id);

create policy "Users can insert their own cards" on public.saved_cards
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own cards" on public.saved_cards
  for update using (auth.uid() = user_id);

create policy "Users can delete their own cards" on public.saved_cards
  for delete using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger handle_saved_cards_updated_at
  before update on public.saved_cards
  for each row
  execute function public.handle_updated_at();

-- Create storage bucket if it doesn't exist
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'card-images'
  ) then
    insert into storage.buckets (id, name, public)
    values ('card-images', 'card-images', false);
  end if;
end $$;

-- Enable storage RLS (safe to run even if policies exist - will just update them)
create policy "Users can view their own card images"
  on storage.objects for select
  using ( bucket_id = 'card-images' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can upload their own card images"
  on storage.objects for insert
  with check ( bucket_id = 'card-images' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can update their own card images"
  on storage.objects for update
  using ( bucket_id = 'card-images' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete their own card images"
  on storage.objects for delete
  using ( bucket_id = 'card-images' and auth.uid()::text = (storage.foldername(name))[1] );
