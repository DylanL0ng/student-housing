DECLARE
    result JSON;
BEGIN
    SELECT json_agg(profile_data) INTO result
    FROM (
        WITH excluded_users AS (
            SELECT cohert2 AS user_id FROM profile_interactions WHERE cohert1 = target_id
            UNION
            SELECT cohert1 AS user_id FROM profile_interactions WHERE cohert2 = target_id AND type = 'dislike'
            UNION
            SELECT cohert1 AS user_id FROM connections WHERE cohert2 = target_id AND type = 'flatmate'
            UNION
            SELECT cohert2 AS user_id FROM connections WHERE cohert1 = target_id AND type = 'flatmate'
        )
        SELECT 
            p.id, 
            p.full_name,  
            COALESCE(
                (SELECT json_agg(interest_id) FROM profile_interests WHERE user_id = p.id), 
                '[]'
            ) AS interests,
            COALESCE(
                (SELECT json_agg(json_build_object('city', l.city, 'point', l.point)) 
                 FROM profile_locations l 
                 WHERE l.user_id = p.id),
                '[]'
            ) AS locations
        FROM profiles p
        WHERE p.id != target_id
        AND NOT EXISTS (SELECT 1 FROM excluded_users e WHERE e.user_id = p.id)
    ) AS profile_data;
    
    RETURN result;
END;
