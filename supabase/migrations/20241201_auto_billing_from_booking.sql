-- Migration: Add automatic billing from booking time
-- Date: 2024-12-01
-- Description: Add columns to support billing from booking time with auto-cancellation

-- 1. Add new columns to bookings table for automatic billing
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS billing_started BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS billing_start_time TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS auto_cancel_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(50), -- 'driver_cancel', 'auto_cancel', 'hardware_exit'
ADD COLUMN IF NOT EXISTS cancellation_time TIMESTAMP;

-- 2. Create function to calculate billing from booking time
CREATE OR REPLACE FUNCTION calculate_booking_billing(
  p_booking_id INTEGER,
  p_end_time TIMESTAMP DEFAULT NOW()
) RETURNS TABLE (
  billing_minutes INTEGER,
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
  v_billing_start TIMESTAMP;
  v_billing_minutes INTEGER;
  v_billable_minutes INTEGER;
  v_final_amount DECIMAL(10,2);
  v_breakdown JSONB;
BEGIN
  -- Get park pricing information and booking details
  SELECT 
    ip.id,
    ip.price_per_minute,
    ip.minimum_booking_minutes,
    ip.billing_increment_minutes,
    ip.grace_period_minutes,
    ip.rounding_policy,
    b.billing_start_time
  INTO 
    v_park_id,
    v_price_per_minute,
    v_minimum_minutes,
    v_increment_minutes,
    v_grace_minutes,
    v_rounding_policy,
    v_billing_start
  FROM bookings b
  JOIN parking_slots ps ON b.slot_id = ps.id
  JOIN it_parks ip ON ps.park_id = ip.id
  WHERE b.id = p_booking_id;

  -- Calculate billing duration from booking time
  v_billing_minutes := EXTRACT(EPOCH FROM (p_end_time - v_billing_start)) / 60;
  
  -- Apply grace period
  IF v_billing_minutes <= v_grace_minutes THEN
    v_billing_minutes := 0;
  END IF;
  
  -- Calculate billable minutes based on policy
  IF v_rounding_policy = 'round_up' THEN
    v_billable_minutes := CEIL(v_billing_minutes / v_increment_minutes) * v_increment_minutes;
  ELSIF v_rounding_policy = 'round_nearest' THEN
    v_billable_minutes := ROUND(v_billing_minutes / v_increment_minutes) * v_increment_minutes;
  ELSE
    v_billable_minutes := FLOOR(v_billing_minutes / v_increment_minutes) * v_increment_minutes;
  END IF;
  
  -- Apply minimum billing
  v_billable_minutes := GREATEST(v_billable_minutes, v_minimum_minutes);
  
  -- Calculate final amount
  v_final_amount := v_billable_minutes * v_price_per_minute;
  
  -- Create billing breakdown
  v_breakdown := jsonb_build_object(
    'rate_per_minute', v_price_per_minute,
    'billing_start_time', v_billing_start,
    'billing_end_time', p_end_time,
    'billing_duration_minutes', v_billing_minutes,
    'grace_period_minutes', v_grace_minutes,
    'billing_increment_minutes', v_increment_minutes,
    'minimum_billing_minutes', v_minimum_minutes,
    'rounding_policy', v_rounding_policy,
    'billable_minutes', v_billable_minutes,
    'final_amount', v_final_amount
  );
  
  RETURN QUERY SELECT 
    v_billing_minutes::INTEGER,
    v_billable_minutes::INTEGER,
    v_final_amount,
    v_breakdown;
END;
$$ LANGUAGE plpgsql;

-- 3. Create function to handle booking cancellation
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id INTEGER,
  p_cancellation_reason VARCHAR(50),
  p_cancellation_time TIMESTAMP DEFAULT NOW()
) RETURNS BOOLEAN AS $$
DECLARE
  v_booking_exists BOOLEAN;
  v_final_amount DECIMAL(10,2);
BEGIN
  -- Check if booking exists and is active
  SELECT EXISTS(
    SELECT 1 FROM bookings 
    WHERE id = p_booking_id 
    AND booking_status = 'active'
  ) INTO v_booking_exists;
  
  IF NOT v_booking_exists THEN
    RAISE EXCEPTION 'Booking % does not exist or is not active', p_booking_id;
  END IF;
  
  -- Calculate final billing amount
  SELECT final_amount INTO v_final_amount
  FROM calculate_booking_billing(p_booking_id, p_cancellation_time);
  
  -- Update booking with cancellation details
  UPDATE bookings 
  SET 
    booking_status = 'cancelled',
    cancellation_reason = p_cancellation_reason,
    cancellation_time = p_cancellation_time,
    actual_end_time = p_cancellation_time,
    final_amount = v_final_amount,
    billing_status = 'calculated'
  WHERE id = p_booking_id;
  
  -- Update parking session
  UPDATE parking_sessions 
  SET 
    session_end = p_cancellation_time,
    is_active = FALSE,
    current_cost = v_final_amount
  WHERE booking_id = p_booking_id AND is_active = TRUE;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 4. Create function to auto-cancel bookings after 1 hour
CREATE OR REPLACE FUNCTION auto_cancel_expired_bookings()
RETURNS INTEGER AS $$
DECLARE
  v_cancelled_count INTEGER := 0;
  v_booking_record RECORD;
BEGIN
  -- Find bookings that are active and billing started more than 1 hour ago
  FOR v_booking_record IN
    SELECT id, billing_start_time
    FROM bookings 
    WHERE booking_status = 'active' 
    AND billing_started = TRUE
    AND billing_start_time < NOW() - INTERVAL '1 hour'
  LOOP
    -- Cancel the booking
    PERFORM cancel_booking(v_booking_record.id, 'auto_cancel', NOW());
    v_cancelled_count := v_cancelled_count + 1;
  END LOOP;
  
  RETURN v_cancelled_count;
END;
$$ LANGUAGE plpgsql;

-- 5. Create function to get real-time billing for active bookings
CREATE OR REPLACE FUNCTION get_active_booking_cost(p_booking_id INTEGER)
RETURNS TABLE (
  current_cost DECIMAL(10,2),
  billing_minutes INTEGER,
  is_active BOOLEAN,
  auto_cancel_in_minutes INTEGER
) AS $$
DECLARE
  v_billing_start TIMESTAMP;
  v_current_time TIMESTAMP := NOW();
  v_price_per_minute DECIMAL(10,2);
  v_billing_minutes INTEGER;
  v_current_cost DECIMAL(10,2);
  v_is_active BOOLEAN;
  v_auto_cancel_in INTEGER;
BEGIN
  -- Get booking details
  SELECT 
    b.billing_start_time,
    ip.price_per_minute,
    ps.is_active
  INTO 
    v_billing_start,
    v_price_per_minute,
    v_is_active
  FROM bookings b
  JOIN parking_slots psl ON b.slot_id = psl.id
  JOIN it_parks ip ON psl.park_id = ip.id
  LEFT JOIN parking_sessions ps ON b.id = ps.booking_id AND ps.is_active = TRUE
  WHERE b.id = p_booking_id AND b.booking_status = 'active';
  
  IF v_billing_start IS NULL THEN
    RETURN QUERY SELECT 0::DECIMAL(10,2), 0::INTEGER, FALSE, 0::INTEGER;
    RETURN;
  END IF;
  
  -- Calculate current billing duration
  v_billing_minutes := EXTRACT(EPOCH FROM (v_current_time - v_billing_start)) / 60;
  v_current_cost := v_billing_minutes * v_price_per_minute;
  
  -- Calculate minutes until auto-cancel (1 hour = 60 minutes)
  v_auto_cancel_in := 60 - v_billing_minutes;
  IF v_auto_cancel_in < 0 THEN
    v_auto_cancel_in := 0;
  END IF;
  
  RETURN QUERY SELECT 
    v_current_cost, 
    v_billing_minutes::INTEGER, 
    COALESCE(v_is_active, TRUE), 
    v_auto_cancel_in::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to auto-cancel bookings
CREATE OR REPLACE FUNCTION trigger_auto_cancel_check()
RETURNS TRIGGER AS $$
BEGIN
  -- This trigger can be called periodically to check for expired bookings
  -- For now, we'll create a manual function that can be called via cron job
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Create view for active bookings with billing info
CREATE OR REPLACE VIEW active_bookings_with_billing AS
SELECT 
  b.id as booking_id,
  b.user_id,
  b.vehicle_number,
  b.billing_start_time,
  b.booking_status,
  ps.current_cost,
  ps.last_updated,
  ip.name as park_name,
  psl.slot_number,
  psl.basement_number,
  ip.price_per_minute,
  EXTRACT(EPOCH FROM (NOW() - b.billing_start_time)) / 60 as billing_minutes,
  CASE 
    WHEN b.billing_start_time < NOW() - INTERVAL '1 hour' THEN 'expired'
    WHEN b.billing_start_time < NOW() - INTERVAL '45 minutes' THEN 'warning'
    ELSE 'active'
  END as billing_status
FROM bookings b
JOIN parking_slots psl ON b.slot_id = psl.id
JOIN it_parks ip ON psl.park_id = ip.id
LEFT JOIN parking_sessions ps ON b.id = ps.booking_id AND ps.is_active = TRUE
WHERE b.booking_status = 'active' AND b.billing_started = TRUE;

-- 8. Create index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_billing_start ON bookings(billing_start_time, booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_auto_cancel ON bookings(billing_started, billing_start_time) WHERE booking_status = 'active';

-- 9. Add RLS policies for new columns
CREATE POLICY "Enable update for billing data" ON bookings
  FOR UPDATE USING (true);

-- 10. Create scheduled job to auto-cancel expired bookings (if using pg_cron)
-- SELECT cron.schedule('auto-cancel-bookings', '*/5 * * * *', 'SELECT auto_cancel_expired_bookings();');

-- 11. Add comments for documentation
COMMENT ON COLUMN bookings.billing_started IS 'Whether billing has started (immediately when booking is made)';
COMMENT ON COLUMN bookings.billing_start_time IS 'Time when billing started (booking confirmation time)';
COMMENT ON COLUMN bookings.auto_cancel_time IS 'Time when booking will be auto-cancelled (1 hour after billing start)';
COMMENT ON COLUMN bookings.cancellation_reason IS 'Reason for cancellation: driver_cancel, auto_cancel, hardware_exit';
COMMENT ON COLUMN bookings.cancellation_time IS 'Time when booking was cancelled';
COMMENT ON FUNCTION calculate_booking_billing IS 'Calculates billing from booking time to end time';
COMMENT ON FUNCTION cancel_booking IS 'Handles booking cancellation with billing calculation';
COMMENT ON FUNCTION auto_cancel_expired_bookings IS 'Auto-cancels bookings after 1 hour';
COMMENT ON FUNCTION get_active_booking_cost IS 'Gets real-time billing cost for active bookings';
