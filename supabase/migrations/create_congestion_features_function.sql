-- supabase/migrations/create_congestion_features_function.sql
CREATE OR REPLACE FUNCTION get_congestion_features_new(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  park_id INTEGER,
  parking_lot TEXT,
  booking_date DATE,
  time_period TEXT,
  booking_count INTEGER,
  available_spots INTEGER
) AS $$
WITH base AS (
  SELECT 
    ps.park_id,
    ip.name AS parking_lot,
    DATE_TRUNC('day', b.start_time)::date AS booking_date,
    CASE 
      WHEN EXTRACT(HOUR FROM b.start_time) BETWEEN 6 AND 11 THEN 'morning'
      WHEN EXTRACT(HOUR FROM b.start_time) BETWEEN 12 AND 17 THEN 'afternoon'
      WHEN EXTRACT(HOUR FROM b.start_time) BETWEEN 18 AND 22 THEN 'evening'
      ELSE NULL
    END AS time_period,
    ip.available_spots
  FROM bookings b
  JOIN parking_slots ps ON b.slot_id = ps.id
  JOIN it_parks ip ON ps.park_id = ip.id
  WHERE 
    b.start_time >= NOW() - (p_days || ' days')::interval
    AND b.booking_status != 'cancelled'
)
SELECT 
  park_id,
  parking_lot,
  booking_date,
  time_period,
  COUNT(*) AS booking_count,
  MAX(available_spots) AS available_spots
FROM base
WHERE time_period IS NOT NULL
GROUP BY park_id, parking_lot, booking_date, time_period
ORDER BY parking_lot, booking_date, time_period;
$$ LANGUAGE sql STABLE;