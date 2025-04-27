CREATE OR REPLACE FUNCTION public.get_profiles_within_distance(
    user_type text,
    exclude_ids uuid[],
    lat double precision,
    lng double precision,
    distance_meters double precision
) 
RETURNS TABLE(id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT p.id
  FROM profiles p
  JOIN profile_locations pl ON p.id = pl.profile_id
  WHERE p.type = user_type
  AND p.id <> ALL(exclude_ids)
  AND ST_DWithin(
    pl.point,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    distance_meters
  );
END;
$function$;