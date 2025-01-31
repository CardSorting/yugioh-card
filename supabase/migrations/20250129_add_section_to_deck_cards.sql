-- Add section column to deck_cards table
alter table public.deck_cards
add column section text not null default 'main'
check (section in ('main', 'extra', 'side'));

-- Add constraint for section card limits
create or replace function check_deck_section_limits()
returns trigger as $$
declare
  section_count integer;
  max_cards integer;
begin
  -- Get current count for this section in the deck
  select coalesce(sum(quantity), 0) into section_count
  from public.deck_cards
  where deck_id = NEW.deck_id
  and section = NEW.section
  and (TG_OP = 'UPDATE' and id != NEW.id or TG_OP = 'INSERT');

  -- Add the new quantity
  section_count := section_count + NEW.quantity;

  -- Set max cards based on section
  case NEW.section
    when 'main' then max_cards := 60;
    when 'extra' then max_cards := 15;
    when 'side' then max_cards := 15;
  end case;

  -- Check if adding this card would exceed the limit
  if section_count > max_cards then
    raise exception 'Cannot exceed % cards in % deck section', max_cards, NEW.section;
  end if;

  return NEW;
end;
$$ language plpgsql;

-- Create trigger for deck section limits
create trigger check_deck_section_limits_trigger
  before insert or update on public.deck_cards
  for each row
  execute function check_deck_section_limits();
