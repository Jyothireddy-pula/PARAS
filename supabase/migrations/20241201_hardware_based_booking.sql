-- Migration: Add hardware-based booking support
-- Date: 2024-12-01
-- Description: Add columns and tables to support hardware-based parking detection and minute-based billing

-- 1. Add new columns to it_parks table for minute-based pricing
ALTER TABLE it_parks 
ADD COLUMN IF NOT EXISTS price_per_minute DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS minimum_booking_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS billing_increment_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS grace_period_minutes INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS rounding_policy VARCHAR(20) DEFAULT 'round_up';

-- 2. Add new columns to bookings table for hardware tracking
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'hardware_based',
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS hardware_entry_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hardware_exit_detected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS actual_duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS billing_status VARCHAR(20) DEFAULT 'pending', -- pending, calculated, paid
ADD COLUMN IF NOT EXISTS hardware_sensor_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS sensor_data JSONB;

-- 3. Create hardware_events table for tracking sensor events
CREATE TABLE IF NOT EXISTS hardware_events (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  event_type VARCHAR(20) NOT NULL, -- entry, exit, sensor_error, sensor_heartbeat
  event_timestamp TIMESTAMP DEFAULT NOW(),
  sensor_id VARCHAR(50) NOT NULL,
  sensor_data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create hardware_sensors table for managing sensor devices
CREATE TABLE IF NOT EXISTS hardware_sensors (
  id SERIAL PRIMARY KEY,
  sensor_id VARCHAR(50) UNIQUE NOT NULL,
  park_id INTEGER REFERENCES it_parks(id) ON DELETE CASCADE,
  slot_id INTEGER REFERENCES parking_slots(id) ON DELETE CASCADE,
  sensor_type VARCHAR(20) NOT NULL, -- ultrasonic, magnetic, camera, weight
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, maintenance, error
  last_heartbeat TIMESTAMP,
  battery_level INTEGER, -- 0-100 for battery-powered sensors
  signal_strength INTEGER, -- 0-100 for wireless sensors
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create parking_sessions table for real-time session tracking
CREATE TABLE IF NOT EXISTS parking_sessions (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  session_start TIMESTAMP DEFAULT NOW(),
  session_end TIMESTAMP,
  current_cost DECIMAL(10,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_hardware_status ON bookings(hardware_entry_detected, hardware_exit_detected);
CREATE INDEX IF NOT EXISTS idx_bookings_billing_status ON bookings(billing_status);
CREATE INDEX IF NOT EXISTS idx_hardware_events_booking ON hardware_events(booking_id, event_type);
CREATE INDEX IF NOT EXISTS idx_hardware_events_timestamp ON hardware_events(event_timestamp);
CREATE INDEX IF NOT EXISTS idx_hardware_sensors_park ON hardware_sensors(park_id);
CREATE INDEX IF NOT EXISTS idx_hardware_sensors_slot ON hardware_sensors(slot_id);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_active ON parking_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_parking_sessions_booking ON parking_sessions(booking_id);

-- 7. Populate price_per_minute from existing price_per_hour
UPDATE it_parks 
SET price_per_minute = ROUND(price_per_hour / 60, 2)
WHERE price_per_minute IS NULL;

-- 8. Create function to calculate hardware-based billing
CREATE OR REPLACE FUNCTION calculate_hardware_billing(
  p_booking_id INTEGER,
  p_actual_start TIMESTAMP,
  p_actual_end TIMESTAMP
) RETURNS TABLE (
  actual_minutes INTEGER,
  billable_minutes INTEGER,
  final_amount DECIMAL(10,2),
  billing_breakdown JSONB
) AS $$
DECLARE
  v_park_id INTEGER;
  v_price_per_minute DECIMAL(10,2);
  v_minimum_minutes INTEGER;
  v_increment_minutes INTEGER;
  v_grace_minutes INTEGER;
  v_rounding_policy VARCHAR(20);
  v_actual_minutes INTEGER;
  v_billable_minutes INTEGER;
  v_final_amount DECIMAL(10,2);
  v_breakdown JSONB;
BEGIN
  -- Get park pricing information
  SELECT 
    ip.id,
    ip.price_per_minute,
    ip.minimum_booking_minutes,
    ip.billing_increment_minutes,
    ip.grace_period_minutes,
    ip.rounding_policy
  INTO 
    v_park_id,
    v_price_per_minute,
    v_minimum_minutes,
    v_increment_minutes,
    v_grace_minutes,
    v_rounding_policy
  FROM bookings b
  JOIN parking_slots ps ON b.slot_id = ps.id
  JOIN it_parks ip ON ps.park_id = ip.id
  WHERE b.id = p_booking_id;

  -- Calculate actual duration in minutes
  v_actual_minutes := EXTRACT(EPOCH FROM (p_actual_end - p_actual_start)) / 60;
  
  -- Apply grace period
  IF v_actual_minutes <= v_grace_minutes THEN
    v_actual_minutes := 0;
  END IF;
  
  -- Calculate billable minutes based on policy
  IF v_rounding_policy = 'round_up' THEN
    v_billable_minutes := CEIL(v_actual_minutes / v_increment_minutes) * v_increment_minutes;
  ELSIF v_rounding_policy = 'round_nearest' THEN
    v_billable_minutes := ROUND(v_actual_minutes / v_increment_minutes) * v_increment_minutes;
  ELSE
    v_billable_minutes := FLOOR(v_actual_minutes / v_increment_minutes) * v_increment_minutes;
  END IF;
  
  -- Apply minimum billing
  v_billable_minutes := GREATEST(v_billable_minutes, v_minimum_minutes);
  
  -- Calculate final amount
  v_final_amount := v_billable_minutes * v_price_per_minute;
  
  -- Create billing breakdown
  v_breakdown := jsonb_build_object(
    'rate_per_minute', v_price_per_minute,
    'actual_duration_minutes', v_actual_minutes,
    'grace_period_minutes', v_grace_minutes,
    'billing_increment_minutes', v_increment_minutes,
    'minimum_billing_minutes', v_minimum_minutes,
    'rounding_policy', v_rounding_policy,
    'billable_minutes', v_billable_minutes,
    'final_amount', v_final_amount
  );
  
  RETURN QUERY SELECT 
    v_actual_minutes::INTEGER,
    v_billable_minutes::INTEGER,
    v_final_amount,
    v_breakdown;
END;
$$ LANGUAGE plpgsql;

-- 9. Create function to process hardware events
CREATE OR REPLACE FUNCTION process_hardware_event(
  p_booking_id INTEGER,
  p_event_type VARCHAR(20),
  p_sensor_id VARCHAR(50),
  p_sensor_data JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_booking_exists BOOLEAN;
  v_current_time TIMESTAMP := NOW();
BEGIN
  -- Check if booking exists
  SELECT EXISTS(SELECT 1 FROM bookings WHERE id = p_booking_id) INTO v_booking_exists;
  
  IF NOT v_booking_exists THEN
    RAISE EXCEPTION 'Booking % does not exist', p_booking_id;
  END IF;
  
  -- Insert hardware event
  INSERT INTO hardware_events (booking_id, event_type, sensor_id, sensor_data)
  VALUES (p_booking_id, p_event_type, p_sensor_id, p_sensor_data);
  
  -- Update booking based on event type
  IF p_event_type = 'entry' THEN
    UPDATE bookings 
    SET 
      actual_start_time = v_current_time,
      hardware_entry_detected = TRUE,
      hardware_sensor_id = p_sensor_id,
      sensor_data = p_sensor_data
    WHERE id = p_booking_id;
    
    -- Start parking session
    INSERT INTO parking_sessions (booking_id, session_start)
    VALUES (p_booking_id, v_current_time);
    
  ELSIF p_event_type = 'exit' THEN
    UPDATE bookings 
    SET 
      actual_end_time = v_current_time,
      hardware_exit_detected = TRUE,
      sensor_data = COALESCE(sensor_data, '{}'::jsonb) || p_sensor_data
    WHERE id = p_booking_id;
    
    -- End parking session and calculate billing
    UPDATE parking_sessions 
    SET 
      session_end = v_current_time,
      is_active = FALSE
    WHERE booking_id = p_booking_id AND is_active = TRUE;
    
    -- Calculate and update final billing
    UPDATE bookings 
    SET 
      actual_duration_minutes = (SELECT actual_minutes FROM calculate_hardware_billing(p_booking_id, actual_start_time, v_current_time)),
      final_amount = (SELECT final_amount FROM calculate_hardware_billing(p_booking_id, actual_start_time, v_current_time)),
      billing_status = 'calculated'
    WHERE id = p_booking_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 10. Create function to get real-time parking cost
CREATE OR REPLACE FUNCTION get_current_parking_cost(p_booking_id INTEGER)
RETURNS TABLE (
  current_cost DECIMAL(10,2),
  duration_minutes INTEGER,
  is_active BOOLEAN
) AS $$
DECLARE
  v_actual_start TIMESTAMP;
  v_current_time TIMESTAMP := NOW();
  v_price_per_minute DECIMAL(10,2);
  v_duration_minutes INTEGER;
  v_current_cost DECIMAL(10,2);
  v_is_active BOOLEAN;
BEGIN
  -- Get booking details
  SELECT 
    b.actual_start_time,
    ip.price_per_minute,
    ps.is_active
  INTO 
    v_actual_start,
    v_price_per_minute,
    v_is_active
  FROM bookings b
  JOIN parking_slots psl ON b.slot_id = psl.id
  JOIN it_parks ip ON psl.park_id = ip.id
  LEFT JOIN parking_sessions ps ON b.id = ps.booking_id AND ps.is_active = TRUE
  WHERE b.id = p_booking_id;
  
  IF v_actual_start IS NULL THEN
    RETURN QUERY SELECT 0::DECIMAL(10,2), 0::INTEGER, FALSE;
    RETURN;
  END IF;
  
  -- Calculate current duration
  v_duration_minutes := EXTRACT(EPOCH FROM (v_current_time - v_actual_start)) / 60;
  v_current_cost := v_duration_minutes * v_price_per_minute;
  
  RETURN QUERY SELECT v_current_cost, v_duration_minutes::INTEGER, COALESCE(v_is_active, FALSE);
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger to update sensor heartbeat
CREATE OR REPLACE FUNCTION update_sensor_heartbeat()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'sensor_heartbeat' THEN
    UPDATE hardware_sensors 
    SET 
      last_heartbeat = NEW.event_timestamp,
      battery_level = (NEW.sensor_data->>'battery_level')::INTEGER,
      signal_strength = (NEW.sensor_data->>'signal_strength')::INTEGER,
      updated_at = NOW()
    WHERE sensor_id = NEW.sensor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sensor_heartbeat
  AFTER INSERT ON hardware_events
  FOR EACH ROW
  EXECUTE FUNCTION update_sensor_heartbeat();

-- 12. Create trigger to update parking session cost
CREATE OR REPLACE FUNCTION update_parking_session_cost()
RETURNS TRIGGER AS $$
DECLARE
  v_current_cost DECIMAL(10,2);
  v_duration_minutes INTEGER;
BEGIN
  -- Get current cost for active sessions
  SELECT current_cost, duration_minutes
  INTO v_current_cost, v_duration_minutes
  FROM get_current_parking_cost(NEW.booking_id);
  
  -- Update parking session
  UPDATE parking_sessions 
  SET 
    current_cost = v_current_cost,
    last_updated = NOW()
  WHERE booking_id = NEW.booking_id AND is_active = TRUE;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Add RLS policies for new tables
ALTER TABLE hardware_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_sessions ENABLE ROW LEVEL SECURITY;

-- Hardware events policies
CREATE POLICY "Enable read access for hardware events" ON hardware_events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for hardware events" ON hardware_events
  FOR INSERT WITH CHECK (true);

-- Hardware sensors policies
CREATE POLICY "Enable read access for hardware sensors" ON hardware_sensors
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for hardware sensors" ON hardware_sensors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for hardware sensors" ON hardware_sensors
  FOR UPDATE USING (true);

-- Parking sessions policies
CREATE POLICY "Enable read access for parking sessions" ON parking_sessions
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for parking sessions" ON parking_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for parking sessions" ON parking_sessions
  FOR UPDATE USING (true);

-- 14. Update existing bookings table policies
CREATE POLICY "Enable update for bookings hardware data" ON bookings
  FOR UPDATE USING (true);

-- 15. Create view for active parking sessions
CREATE OR REPLACE VIEW active_parking_sessions AS
SELECT 
  ps.id as session_id,
  ps.booking_id,
  b.user_id,
  b.vehicle_number,
  b.actual_start_time,
  ps.current_cost,
  ps.last_updated,
  ip.name as park_name,
  psl.slot_number,
  psl.basement_number,
  ip.price_per_minute
FROM parking_sessions ps
JOIN bookings b ON ps.booking_id = b.id
JOIN parking_slots psl ON b.slot_id = psl.id
JOIN it_parks ip ON psl.park_id = ip.id
WHERE ps.is_active = TRUE;

-- 16. Create view for hardware sensor status
CREATE OR REPLACE VIEW hardware_sensor_status AS
SELECT 
  hs.id,
  hs.sensor_id,
  hs.sensor_type,
  hs.status,
  hs.last_heartbeat,
  hs.battery_level,
  hs.signal_strength,
  ip.name as park_name,
  psl.slot_number,
  psl.basement_number,
  CASE 
    WHEN hs.last_heartbeat IS NULL THEN 'offline'
    WHEN hs.last_heartbeat < NOW() - INTERVAL '5 minutes' THEN 'offline'
    ELSE 'online'
  END as connection_status
FROM hardware_sensors hs
JOIN it_parks ip ON hs.park_id = ip.id
JOIN parking_slots psl ON hs.slot_id = psl.id;

-- 17. Add comments for documentation
COMMENT ON TABLE hardware_events IS 'Tracks all hardware sensor events (entry, exit, errors, heartbeats)';
COMMENT ON TABLE hardware_sensors IS 'Manages hardware sensor devices and their status';
COMMENT ON TABLE parking_sessions IS 'Tracks active parking sessions for real-time billing';
COMMENT ON COLUMN bookings.booking_type IS 'Type of booking: hardware_based or traditional';
COMMENT ON COLUMN bookings.actual_start_time IS 'Actual time when car entered (detected by hardware)';
COMMENT ON COLUMN bookings.actual_end_time IS 'Actual time when car left (detected by hardware)';
COMMENT ON COLUMN bookings.hardware_entry_detected IS 'Whether hardware detected car entry';
COMMENT ON COLUMN bookings.hardware_exit_detected IS 'Whether hardware detected car exit';
COMMENT ON COLUMN bookings.actual_duration_minutes IS 'Actual parking duration in minutes';
COMMENT ON COLUMN bookings.final_amount IS 'Final calculated amount based on actual duration';
COMMENT ON COLUMN bookings.billing_status IS 'Billing status: pending, calculated, paid';
COMMENT ON COLUMN it_parks.price_per_minute IS 'Price per minute for hardware-based billing';
COMMENT ON COLUMN it_parks.minimum_booking_minutes IS 'Minimum billable duration in minutes';
COMMENT ON COLUMN it_parks.billing_increment_minutes IS 'Billing increment in minutes (e.g., 15 min blocks)';
COMMENT ON COLUMN it_parks.grace_period_minutes IS 'Grace period in minutes (no charge if under this)';
COMMENT ON COLUMN it_parks.rounding_policy IS 'How to round billing: round_up, round_nearest, round_down';
