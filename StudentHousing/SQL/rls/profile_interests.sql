-- Delete policy for users to delete their own profile interests
create policy "Allow users to delete their own profile interests"
on public.profile_interests
to public
using (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = profile_interests.profile_id
      and profile_mapping.linked_profile = auth.uid()
  )
);

-- Insert policy for users to add their own profile interests
create policy "Allow users to insert their own profile interests"
on public.profile_interests
to public
with check (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = profile_interests.profile_id
      and profile_mapping.linked_profile = auth.uid()
  )
);

-- General read access for all users to profile interests
create policy "Allow public read access to profile interests"
on public.profile_interests
to public
using (true);