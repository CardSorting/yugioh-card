-- Create dalle_generations table
create table public.dalle_generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt text not null,
  image_url text not null,
  used_in_card uuid references public.saved_cards(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.dalle_generations enable row level security;

-- Create policies
create policy "Users can view their own generations" on public.dalle_generations
  for select using (auth.uid() = user_id);

create policy "Users can insert their own generations" on public.dalle_generations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own generations" on public.dalle_generations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own generations" on public.dalle_generations
  for delete using (auth.uid() = user_id);

-- Create storage bucket for DALL-E generations if it doesn't exist
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'dalle-generations'
  ) then
    insert into storage.buckets (id, name, public)
    values ('dalle-generations', 'dalle-generations', false);
  end if;
end $$;

-- Enable storage RLS for DALL-E generations
create policy "Users can view their own DALL-E generations"
  on storage.objects for select
  using ( bucket_id = 'dalle-generations' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can upload their own DALL-E generations"
  on storage.objects for insert
  with check ( bucket_id = 'dalle-generations' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can update their own DALL-E generations"
  on storage.objects for update
  using ( bucket_id = 'dalle-generations' and auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete their own DALL-E generations"
  on storage.objects for delete
  using ( bucket_id = 'dalle-generations' and auth.uid()::text = (storage.foldername(name))[1] );

-- Create index for faster lookups
create index dalle_generations_user_id_idx on public.dalle_generations(user_id);
create index dalle_generations_used_in_card_idx on public.dalle_generations(used_in_card);
