create or replace function filter_profiles_by_age(
  min_birthdate timestamp,
  max_birthdate timestamp,
  profile_ids uuid[]
)
returns table(profile_id uuid)
language sql
as $$
  select profile_id
  from profile_information
  where key = 'age'
    and (profile_information.value->'data'->>'value')::timestamp >= min_birthdate
    and (profile_information.value->'data'->>'value')::timestamp <= max_birthdate
    and profile_id = any(profile_ids)
$$;

