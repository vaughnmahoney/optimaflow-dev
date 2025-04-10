-- Script to populate start_time from completion_response JSON data
-- This will update records that have end_time but not start_time

-- First, let's check how many records need updating
SELECT COUNT(*) AS records_to_update
FROM reports
WHERE end_time IS NOT NULL AND start_time IS NULL;

-- Check the structure of the completion_response to understand the JSON path
SELECT order_no, completion_response
FROM reports
WHERE completion_response IS NOT NULL
LIMIT 3;

-- Update start_time from completion_response for records that have end_time but not start_time
UPDATE reports
SET start_time = 
  CASE 
    -- Try to extract localTime first (preferred)
    WHEN completion_response->'data'->'startTime'->'localTime' IS NOT NULL THEN 
      (completion_response->'data'->'startTime'->'localTime')::text::timestamp with time zone
    -- Fall back to utcTime if localTime is not available
    WHEN completion_response->'data'->'startTime'->'utcTime' IS NOT NULL THEN 
      (completion_response->'data'->'startTime'->'utcTime')::text::timestamp with time zone
    ELSE NULL
  END
WHERE end_time IS NOT NULL 
  AND start_time IS NULL
  AND completion_response IS NOT NULL;

-- Check how many records were updated
SELECT COUNT(*) AS records_with_start_time
FROM reports
WHERE start_time IS NOT NULL;

-- Check a sample of updated records
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
