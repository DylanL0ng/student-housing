create or replace function filter_profiles_by_selected_values(
    selected_values text[], 
    filter_key text,
    profile_ids uuid[]
)
returns table(profile_id uuid)
language plpgsql
as $$
begin
    return query
    select pi.profile_id
    from profile_information pi
    where pi.key = filter_key
    and pi.profile_id = any(profile_ids)
    and pi.value->'data'->'value' @> to_jsonb(selected_values);
end;
$$;

