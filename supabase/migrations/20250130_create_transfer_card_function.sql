-- Function to transfer a card from one user to another
create or replace function transfer_card(
  card_id uuid,
  new_owner_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  -- Update the card's owner
  update saved_cards
  set user_id = new_owner_id,
      updated_at = now()
  where id = card_id;
  
  -- Throw an error if card wasn't found
  if not found then
    raise exception 'Card not found';
  end if;
end;
$$;
