-- Insert policy for users to join conversations based on user_id
create policy "Allow users to join conversations based on user_id"
on public.conversation_members
to public
with check (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = conversation_members.user_id
      and profile_mapping.linked_profile = auth.uid()
  )
);

-- General read access for all users to conversation_members
create policy "Allow public read access to conversation members"
on public.conversation_members
to public
using (true);