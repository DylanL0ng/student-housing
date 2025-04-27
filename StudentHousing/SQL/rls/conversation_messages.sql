-- Insert policy for users to send conversation messages based on user_id
create policy "Allow users to send conversation messages based on user_id"
on public.conversation_messages
to public
with check (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = conversation_messages.sender_id
      and profile_mapping.linked_profile = auth.uid()
  )
);

-- General read access for all users to conversation messages
create policy "Allow public read access to conversation messages"
on public.conversation_messages
to public
using (true);