-- Insert policy for users to create connections based on their user_id (cohert1)
create policy "Allow users to insert connections for cohert1 based on user_id"
on public.connections
to public
with check (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = connections.cohert1
      and profile_mapping.linked_profile = auth.uid()
  )
);

-- Read access policy for users to view connections based on their user_id (cohert2)
create policy "Allow users to view connections for cohert2 based on user_id"
on public.connections
to public
using (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.id = connections.cohert2
      and profile_mapping.linked_profile = auth.uid()
  )
);