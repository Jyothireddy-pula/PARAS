-- Migration: Migrate existing data to hardware-based system
-- Date: 2024-12-01
-- Description: Update existing bookings and parks to support hardware-based system

-- 1. Update existing bookings to have hardware-based type
UPDATE bookings 
SET 
  booking_type = 'hardware_based',
  actual_start_time = start_time,
  actual_end_time = end_time,
  hardware_entry_detected = TRUE,
  hardware_exit_detected = TRUE,
  billing_status = 'calculated'
WHERE booking_type IS NULL;

-- 2. Calculate actual duration and final amount for existing bookings
UPDATE bookings 
SET 
  actual_duration_minutes = EXTRACT(EPOCH FROM (actual_end_time - actual_start_time)) / 60,
  final_amount = (
    SELECT 
      (EXTRACT(EPOCH FROM (actual_end_time - actual_start_time)) / 60) * (ip.price_per_hour / 60)
    FROM parking_slots ps
    JOIN it_parks ip ON ps.park_id = ip.id
    WHERE ps.id = bookings.slot_id
  )
WHERE actual_duration_minutes IS NULL;

-- 3. Create parking sessions for existing completed bookings
INSERT INTO parking_sessions (booking_id, session_start, session_end, current_cost, is_active)
SELECT 
  b.id,
  b.actual_start_time,
  b.actual_end_time,
  b.final_amount,
  FALSE
FROM bookings b
WHERE b.hardware_exit_detected = TRUE
AND NOT EXISTS (
  SELECT 1 FROM parking_sessions ps WHERE ps.booking_id = b.id
);

-- 4. Update it_parks with default hardware settings if not set
UPDATE it_parks 
SET 
  minimum_booking_minutes = 15,
  billing_increment_minutes = 15,
  grace_period_minutes = 5,
  rounding_policy = 'round_up'
WHERE minimum_booking_minutes IS NULL;

-- 5. Create sample hardware sensors for existing parks
-- This is a template - you'll need to replace with actual sensor IDs
INSERT INTO hardware_sensors (sensor_id, park_id, slot_id, sensor_type, status)
SELECT 
  'SENSOR_' || ip.id || '_' || ps.id,
  ip.id,
  ps.id,
  'ultrasonic',
  'active'
FROM it_parks ip
JOIN parking_slots ps ON ip.id = ps.park_id
WHERE NOT EXISTS (
  SELECT 1 FROM hardware_sensors hs 
  WHERE hs.park_id = ip.id AND hs.slot_id = ps.id
);

-- 6. Create hardware events for existing bookings (simulated)
INSERT INTO hardware_events (booking_id, event_type, sensor_id, event_timestamp, processed)
SELECT 
  b.id,
  'entry',
  'SENSOR_' || ip.id || '_' || ps.id,
  b.actual_start_time,
  TRUE
FROM bookings b
JOIN parking_slots ps ON b.slot_id = ps.id
JOIN it_parks ip ON ps.park_id = ip.id
WHERE b.hardware_entry_detected = TRUE;

INSERT INTO hardware_events (booking_id, event_type, sensor_id, event_timestamp, processed)
SELECT 
  b.id,
  'exit',
  'SENSOR_' || ip.id || '_' || ps.id,
  b.actual_end_time,
  TRUE
FROM bookings b
JOIN parking_slots ps ON b.slot_id = ps.id
JOIN it_parks ip ON ps.park_id = ip.id
WHERE b.hardware_exit_detected = TRUE;

-- 7. Update booking status for completed bookings
UPDATE bookings 
SET billing_status = 'paid'
WHERE hardware_exit_detected = TRUE 
AND final_amount > 0
AND billing_status = 'calculated';

-- 8. Create indexes for better performance on existing data
CREATE INDEX IF NOT EXISTS idx_bookings_actual_times ON bookings(actual_start_time, actual_end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, billing_status);
CREATE INDEX IF NOT EXISTS idx_hardware_events_processed ON hardware_events(processed, event_timestamp);

-- 9. Update statistics and analytics functions to work with new schema
CREATE OR REPLACE FUNCTION get_parking_statistics(park_id INTEGER, start_date DATE, end_date DATE)
RETURNS TABLE (
  total_bookings INTEGER,
  total_revenue DECIMAL(10,2),
  average_duration_minutes INTEGER,
  peak_hour INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_bookings,
    COALESCE(SUM(b.final_amount), 0) as total_revenue,
    COALESCE(AVG(b.actual_duration_minutes), 0)::INTEGER as average_duration_minutes,
    EXTRACT(HOUR FROM b.actual_start_time)::INTEGER as peak_hour
  FROM bookings b
  JOIN parking_slots ps ON b.slot_id = ps.id
  WHERE ps.park_id = p_park_id
    AND b.actual_start_time::DATE BETWEEN start_date AND end_date
    AND b.hardware_exit_detected = TRUE
  GROUP BY EXTRACT(HOUR FROM b.actual_start_time)
  ORDER BY COUNT(*) DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get real-time occupancy
CREATE OR REPLACE FUNCTION get_park_occupancy(park_id INTEGER)
RETURNS TABLE (
  total_slots INTEGER,
  occupied_slots INTEGER,
  available_slots INTEGER,
  occupancy_percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(ps.id)::INTEGER as total_slots,
    COUNT(CASE WHEN ps.status = 'Occupied' THEN 1 END)::INTEGER as occupied_slots,
    COUNT(CASE WHEN ps.status = 'Available' THEN 1 END)::INTEGER as available_slots,
    ROUND(
      (COUNT(CASE WHEN ps.status = 'Occupied' THEN 1 END)::DECIMAL / COUNT(ps.id)) * 100, 
      2
    ) as occupancy_percentage
  FROM parking_slots ps
  WHERE ps.park_id = p_park_id;
END;
$$ LANGUAGE plpgsql;

-- 11. Create function to get sensor health status
CREATE OR REPLACE FUNCTION get_sensor_health_status(park_id INTEGER)
RETURNS TABLE (
  total_sensors INTEGER,
  online_sensors INTEGER,
  offline_sensors INTEGER,
  low_battery_sensors INTEGER,
  health_percentage DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(hs.id)::INTEGER as total_sensors,
    COUNT(CASE WHEN hs.last_heartbeat > NOW() - INTERVAL '5 minutes' THEN 1 END)::INTEGER as online_sensors,
    COUNT(CASE WHEN hs.last_heartbeat IS NULL OR hs.last_heartbeat <= NOW() - INTERVAL '5 minutes' THEN 1 END)::INTEGER as offline_sensors,
    COUNT(CASE WHEN hs.battery_level < 20 THEN 1 END)::INTEGER as low_battery_sensors,
    ROUND(
      (COUNT(CASE WHEN hs.last_heartbeat > NOW() - INTERVAL '5 minutes' THEN 1 END)::DECIMAL / COUNT(hs.id)) * 100, 
      2
    ) as health_percentage
  FROM hardware_sensors hs
  WHERE hs.park_id = p_park_id;
END;
$$ LANGUAGE plpgsql;

-- 12. Create materialized view for dashboard analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS parking_analytics_daily AS
SELECT 
  DATE(b.actual_start_time) as booking_date,
  ip.id as park_id,
  ip.name as park_name,
  COUNT(*) as total_bookings,
  SUM(b.final_amount) as total_revenue,
  AVG(b.actual_duration_minutes) as avg_duration_minutes,
  COUNT(CASE WHEN b.hardware_entry_detected = TRUE THEN 1 END) as successful_entries,
  COUNT(CASE WHEN b.hardware_exit_detected = TRUE THEN 1 END) as successful_exits
FROM bookings b
JOIN parking_slots ps ON b.slot_id = ps.id
JOIN it_parks ip ON ps.park_id = ip.id
WHERE b.actual_start_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(b.actual_start_time), ip.id, ip.name
ORDER BY booking_date DESC, total_revenue DESC;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_parking_analytics_daily_date ON parking_analytics_daily(booking_date);
CREATE INDEX IF NOT EXISTS idx_parking_analytics_daily_park ON parking_analytics_daily(park_id);

-- 13. Create function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_parking_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW parking_analytics_daily;
END;
$$ LANGUAGE plpgsql;

-- 14. Create scheduled job to refresh analytics (if using pg_cron)
-- SELECT cron.schedule('refresh-parking-analytics', '0 1 * * *', 'SELECT refresh_parking_analytics();');

-- 15. Add constraints for data integrity
ALTER TABLE bookings 
ADD CONSTRAINT check_actual_times 
CHECK (actual_end_time IS NULL OR actual_end_time >= actual_start_time);

ALTER TABLE bookings 
ADD CONSTRAINT check_duration_positive 
CHECK (actual_duration_minutes IS NULL OR actual_duration_minutes >= 0);

ALTER TABLE bookings 
ADD CONSTRAINT check_final_amount_positive 
CHECK (final_amount IS NULL OR final_amount >= 0);

ALTER TABLE hardware_sensors 
ADD CONSTRAINT check_battery_level 
CHECK (battery_level IS NULL OR (battery_level >= 0 AND battery_level <= 100));

ALTER TABLE hardware_sensors 
ADD CONSTRAINT check_signal_strength 
CHECK (signal_strength IS NULL OR (signal_strength >= 0 AND signal_strength <= 100));

-- 16. Create audit trigger for hardware events
CREATE OR REPLACE FUNCTION audit_hardware_events()
RETURNS TRIGGER AS $$
BEGIN
  -- Log significant events
  IF NEW.event_type IN ('entry', 'exit') THEN
    INSERT INTO hardware_events (booking_id, event_type, sensor_id, event_timestamp, sensor_data)
    VALUES (NEW.booking_id, 'audit_' || NEW.event_type, NEW.sensor_id, NOW(), 
            jsonb_build_object('original_event_id', NEW.id, 'timestamp', NEW.event_timestamp));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_hardware_events
  AFTER INSERT ON hardware_events
  FOR EACH ROW
  EXECUTE FUNCTION audit_hardware_events();

-- 17. Final data validation
DO $$
DECLARE
  v_invalid_bookings INTEGER;
  v_missing_sensors INTEGER;
BEGIN
  -- Check for bookings with invalid time ranges
  SELECT COUNT(*) INTO v_invalid_bookings
  FROM bookings 
  WHERE actual_end_time < actual_start_time;
  
  IF v_invalid_bookings > 0 THEN
    RAISE WARNING 'Found % bookings with invalid time ranges', v_invalid_bookings;
  END IF;
  
  -- Check for parks without sensors
  SELECT COUNT(*) INTO v_missing_sensors
  FROM it_parks ip
  WHERE NOT EXISTS (
    SELECT 1 FROM hardware_sensors hs WHERE hs.park_id = ip.id
  );
  
  IF v_missing_sensors > 0 THEN
    RAISE WARNING 'Found % parks without hardware sensors', v_missing_sensors;
  END IF;
  
  RAISE NOTICE 'Data migration completed successfully';
END;
$$;
