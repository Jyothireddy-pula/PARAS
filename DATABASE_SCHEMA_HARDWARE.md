# Hardware-Based Parking System Database Schema

## Overview
This document describes the database schema changes made to support hardware-based parking detection and minute-based billing.

## New Tables

### 1. `hardware_events`
Tracks all hardware sensor events (entry, exit, errors, heartbeats).

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique event ID |
| `booking_id` | INTEGER | Reference to bookings table |
| `event_type` | VARCHAR(20) | Type of event: entry, exit, sensor_error, sensor_heartbeat |
| `event_timestamp` | TIMESTAMP | When the event occurred |
| `sensor_id` | VARCHAR(50) | ID of the sensor that triggered the event |
| `sensor_data` | JSONB | Additional sensor data (battery, signal strength, etc.) |
| `processed` | BOOLEAN | Whether the event has been processed |
| `created_at` | TIMESTAMP | When the record was created |

### 2. `hardware_sensors`
Manages hardware sensor devices and their status.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique sensor ID |
| `sensor_id` | VARCHAR(50) UNIQUE | Hardware sensor identifier |
| `park_id` | INTEGER | Reference to it_parks table |
| `slot_id` | INTEGER | Reference to parking_slots table |
| `sensor_type` | VARCHAR(20) | Type of sensor: ultrasonic, magnetic, camera, weight |
| `status` | VARCHAR(20) | Sensor status: active, inactive, maintenance, error |
| `last_heartbeat` | TIMESTAMP | Last time sensor sent a heartbeat |
| `battery_level` | INTEGER | Battery level (0-100) for battery-powered sensors |
| `signal_strength` | INTEGER | Signal strength (0-100) for wireless sensors |
| `created_at` | TIMESTAMP | When the sensor was added |
| `updated_at` | TIMESTAMP | Last update time |

### 3. `parking_sessions`
Tracks active parking sessions for real-time billing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL PRIMARY KEY | Unique session ID |
| `booking_id` | INTEGER | Reference to bookings table |
| `session_start` | TIMESTAMP | When the session started |
| `session_end` | TIMESTAMP | When the session ended (NULL if active) |
| `current_cost` | DECIMAL(10,2) | Current cost of the session |
| `last_updated` | TIMESTAMP | Last time the cost was updated |
| `is_active` | BOOLEAN | Whether the session is currently active |

## Modified Tables

### 1. `it_parks` (New Columns)
Added columns for minute-based pricing and billing policies.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `price_per_minute` | DECIMAL(10,2) | Calculated from price_per_hour/60 | Price per minute for hardware-based billing |
| `minimum_booking_minutes` | INTEGER | 15 | Minimum billable duration in minutes |
| `billing_increment_minutes` | INTEGER | 15 | Billing increment in minutes (e.g., 15 min blocks) |
| `grace_period_minutes` | INTEGER | 5 | Grace period in minutes (no charge if under this) |
| `rounding_policy` | VARCHAR(20) | 'round_up' | How to round billing: round_up, round_nearest, round_down |

### 2. `bookings` (New Columns)
Added columns for hardware tracking and actual billing.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `booking_type` | VARCHAR(20) | 'hardware_based' | Type of booking: hardware_based or traditional |
| `actual_start_time` | TIMESTAMP | NULL | Actual time when car entered (detected by hardware) |
| `actual_end_time` | TIMESTAMP | NULL | Actual time when car left (detected by hardware) |
| `hardware_entry_detected` | BOOLEAN | FALSE | Whether hardware detected car entry |
| `hardware_exit_detected` | BOOLEAN | FALSE | Whether hardware detected car exit |
| `actual_duration_minutes` | INTEGER | NULL | Actual parking duration in minutes |
| `final_amount` | DECIMAL(10,2) | NULL | Final calculated amount based on actual duration |
| `billing_status` | VARCHAR(20) | 'pending' | Billing status: pending, calculated, paid |
| `hardware_sensor_id` | VARCHAR(50) | NULL | ID of the sensor used for this booking |
| `sensor_data` | JSONB | NULL | Additional sensor data for this booking |

## Key Functions

### 1. `calculate_hardware_billing(booking_id, actual_start, actual_end)`
Calculates the final billing amount based on actual parking duration.

**Returns:**
- `actual_minutes`: Actual duration in minutes
- `billable_minutes`: Billable duration after applying policies
- `final_amount`: Final amount to charge
- `billing_breakdown`: JSON with detailed breakdown

### 2. `process_hardware_event(booking_id, event_type, sensor_id, sensor_data)`
Processes hardware events and updates booking status.

**Event Types:**
- `entry`: Car entered the parking slot
- `exit`: Car left the parking slot
- `sensor_error`: Sensor encountered an error
- `sensor_heartbeat`: Sensor status update

### 3. `get_current_parking_cost(booking_id)`
Gets real-time parking cost for active sessions.

**Returns:**
- `current_cost`: Current cost of the session
- `duration_minutes`: Current duration in minutes
- `is_active`: Whether the session is active

### 4. `get_parking_statistics(park_id, start_date, end_date)`
Gets parking statistics for a specific park and date range.

**Returns:**
- `total_bookings`: Number of bookings
- `total_revenue`: Total revenue generated
- `average_duration_minutes`: Average parking duration
- `peak_hour`: Hour with most bookings

### 5. `get_park_occupancy(park_id)`
Gets real-time occupancy information for a park.

**Returns:**
- `total_slots`: Total number of slots
- `occupied_slots`: Number of occupied slots
- `available_slots`: Number of available slots
- `occupancy_percentage`: Percentage of slots occupied

### 6. `get_sensor_health_status(park_id)`
Gets hardware sensor health status for a park.

**Returns:**
- `total_sensors`: Total number of sensors
- `online_sensors`: Number of online sensors
- `offline_sensors`: Number of offline sensors
- `low_battery_sensors`: Number of sensors with low battery
- `health_percentage`: Percentage of healthy sensors

## Views

### 1. `active_parking_sessions`
View of all currently active parking sessions with user and park information.

### 2. `hardware_sensor_status`
View of all hardware sensors with their current status and connection information.

### 3. `parking_analytics_daily` (Materialized View)
Daily analytics for parking usage, revenue, and performance.

## Indexes

### Performance Indexes
- `idx_bookings_hardware_status`: Hardware detection status
- `idx_bookings_billing_status`: Billing status
- `idx_hardware_events_booking`: Events by booking
- `idx_hardware_events_timestamp`: Events by timestamp
- `idx_hardware_sensors_park`: Sensors by park
- `idx_hardware_sensors_slot`: Sensors by slot
- `idx_parking_sessions_active`: Active sessions
- `idx_parking_sessions_booking`: Sessions by booking

## Row Level Security (RLS)

### Policies
- **hardware_events**: Read access for all, insert access for all
- **hardware_sensors**: Read access for all, insert/update access for all
- **parking_sessions**: Read access for all, insert/update access for all
- **bookings**: Updated to allow hardware data updates

## Triggers

### 1. `update_sensor_heartbeat`
Updates sensor status when heartbeat events are received.

### 2. `update_parking_session_cost`
Updates parking session cost when hardware events occur.

### 3. `audit_hardware_events`
Logs significant hardware events for audit purposes.

## Data Migration

### Existing Data Updates
1. **Bookings**: Updated to hardware-based type with simulated entry/exit times
2. **Parks**: Added minute-based pricing and billing policies
3. **Sensors**: Created sample sensors for existing parks
4. **Events**: Created simulated hardware events for existing bookings
5. **Sessions**: Created parking sessions for completed bookings

### Validation
- Checks for invalid time ranges
- Verifies sensor coverage
- Validates data integrity

## Usage Examples

### 1. Process Car Entry
```sql
SELECT process_hardware_event(123, 'entry', 'SENSOR_001', '{"battery": 85, "signal": 90}');
```

### 2. Process Car Exit
```sql
SELECT process_hardware_event(123, 'exit', 'SENSOR_001', '{"battery": 83, "signal": 88}');
```

### 3. Get Current Cost
```sql
SELECT * FROM get_current_parking_cost(123);
```

### 4. Get Park Statistics
```sql
SELECT * FROM get_parking_statistics(1, '2024-12-01', '2024-12-31');
```

### 5. Get Sensor Health
```sql
SELECT * FROM get_sensor_health_status(1);
```

## Maintenance

### Regular Tasks
1. **Refresh Analytics**: Run `SELECT refresh_parking_analytics();` daily
2. **Clean Old Events**: Archive events older than 90 days
3. **Monitor Sensor Health**: Check for offline sensors
4. **Update Sensor Status**: Monitor battery levels and signal strength

### Monitoring
- Track sensor connectivity
- Monitor billing accuracy
- Check for failed hardware events
- Validate data integrity

## Security Considerations

1. **Sensor Authentication**: Implement proper authentication for hardware devices
2. **Data Encryption**: Encrypt sensitive sensor data
3. **Access Control**: Limit access to hardware management functions
4. **Audit Logging**: Maintain comprehensive audit trails
5. **Data Privacy**: Ensure compliance with data protection regulations

## Performance Optimization

1. **Indexing**: Strategic indexes on frequently queried columns
2. **Partitioning**: Consider partitioning large tables by date
3. **Materialized Views**: Pre-computed analytics for dashboard performance
4. **Connection Pooling**: Optimize database connections
5. **Query Optimization**: Regular query performance analysis

## Backup and Recovery

1. **Regular Backups**: Daily full backups, hourly incremental
2. **Point-in-Time Recovery**: Enable WAL archiving
3. **Disaster Recovery**: Multi-region backup strategy
4. **Data Validation**: Regular backup integrity checks
5. **Recovery Testing**: Regular recovery procedure testing
