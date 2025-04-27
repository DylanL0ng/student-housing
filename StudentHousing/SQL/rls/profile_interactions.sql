-- Insert policy for users to insert their own interactions
create policy "Allow users to insert their own profile interactions"
on public.profile_interactions
to public
with check (
  (EXISTS ( SELECT 1
   FROM profile_mapping
  WHERE ((profile_mapping.id = profile_interactions.cohert1) AND (profile_mapping.linked_profile = ( SELECT auth.uid() AS uid)))))
);

-- Select policy for users to select interactions they are part of
create policy "Allow users to view interactions they are part of"
on public.profile_interactions
to public
using (
  exists (
    select 1
    from profile_mapping
    where profile_mapping.linked_profile = auth.uid()
      and profile_mapping.id in (profile_interactions.cohert1, profile_interactions.cohert2)
  )
);

-- -- Update policy for users to update their own profile interactions
-- create policy "Allow users to update their own profile interactions"
-- on public.profile_interactions
-- to public
-- using (
--   exists (
--     select 1
--     from profile_mapping
--     where profile_mapping.linked_profile = auth.uid()
--       and profile_mapping.id = profile_interactions.cohert1
--   )
-- );

-- -- Delete policy for users to delete interactions they are a part of
-- create policy "Allow users to delete interactions they are part of"
-- on public.profile_interactions
-- to public
-- using (
--   exists (
--     select 1
--     from profile_mapping
--     where profile_mapping.linked_profile = auth.uid()
--       and profile_mapping.id in (profile_interactions.cohert1, profile_interactions.cohert2)
--   )
-- );

