-- Insert policy for users to add their own profiles' locations
create policy "Allow users to insert their own profiles' locations"
on profile_locations
for insert
with check (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = profile_locations.profile_id
      and profile_mapping.linked_profile = (select auth.uid())
  )
);

-- Update policy for users to update their own profiles' locations
create policy "Allow users to update their own profiles' locations"
on profile_locations
for update
using (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = profile_locations.profile_id
      and profile_mapping.linked_profile = auth.uid()
  )
);

-- General read access for all users to profile_locations
create policy "Allow public read access to profile locations"
on public.profile_locations
to public
using (true);