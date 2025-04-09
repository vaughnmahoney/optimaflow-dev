
-- Script to populate start_time from matching work_orders completion_response data
-- This will find work_orders with start_time data and update the corresponding reports

-- First, let's check how many records need updating
SELECT COUNT(*) AS records_to_update
FROM reports
WHERE end_time IS NOT NULL AND start_time IS NULL;

-- Create a temporary view to extract start_time data from work_orders
DROP VIEW IF EXISTS work_order_start_times;
CREATE TEMP VIEW work_order_start_times AS
SELECT 
  order_no,
  CASE 
    -- Try direct path
    WHEN completion_response->'orders'->0->'data'->'startTime'->'localTime' IS NOT NULL THEN 
      (completion_response->'orders'->0->'data'->'startTime'->'localTime')::text::timestamp with time zone
    
    -- Try data.startTime path
    WHEN completion_response->'data'->'startTime'->'localTime' IS NOT NULL THEN 
      (completion_response->'data'->'startTime'->'localTime')::text::timestamp with time zone
    
    -- Try completionDetails.data.startTime path
    WHEN completion_response->'completionDetails'->'data'->'startTime'->'localTime' IS NOT NULL THEN 
      (completion_response->'completionDetails'->'data'->'startTime'->'localTime')::text::timestamp with time zone
    
    -- If no localTime is found, try the same paths with utcTime
    WHEN completion_response->'orders'->0->'data'->'startTime'->'utcTime' IS NOT NULL THEN 
      (completion_response->'orders'->0->'data'->'startTime'->'utcTime')::text::timestamp with time zone
    
    ELSE NULL
  END AS start_time
FROM work_orders
WHERE completion_response IS NOT NULL;

-- Update reports with start_time data from work_orders
UPDATE reports r
SET start_time = wo.start_time,
    -- Calculate job_duration if we have both start and end times
    job_duration = CASE 
                     WHEN r.end_time IS NOT NULL AND wo.start_time IS NOT NULL 
                     THEN r.end_time - wo.start_time
                     ELSE r.job_duration
                   END
FROM work_order_start_times wo
WHERE r.order_no = wo.order_no
  AND r.start_time IS NULL
  AND wo.start_time IS NOT NULL;

-- Check how many records were updated
SELECT COUNT(*) AS records_with_start_time
FROM reports
WHERE start_time IS NOT NULL;

-- Sample of updated records
SELECT 
  order_no, 
  status, 
  start_time, 
  end_time, 
  job_duration
FROM reports
WHERE start_time IS NOT NULL
ORDER BY end_time DESC
LIMIT 10;

-- Check remaining records that couldn't be updated
SELECT COUNT(*) AS records_still_missing_start_time
FROM reports
WHERE end_time IS NOT NULL AND start_time IS NULL;

-- Drop the temporary view
DROP VIEW IF EXISTS work_order_start_times;
