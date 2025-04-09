
-- Script to populate start_time from completion_response JSON data
-- This improved script checks multiple possible JSON paths where startTime might be located

-- First, let's check how many records need updating
SELECT COUNT(*) AS records_to_update
FROM reports
WHERE end_time IS NOT NULL AND start_time IS NULL;

-- Update start_time using various possible JSON paths
-- This attempts to handle different JSON structure variations in the completion_response
UPDATE reports
SET start_time = 
  CASE 
    -- Try direct path
    WHEN completion_response->'data'->'startTime'->'localTime' IS NOT NULL THEN 
      (completion_response->'data'->'startTime'->'localTime')::text::timestamp with time zone
    
    -- Try orders[0].data.startTime path
    WHEN completion_response->'orders'->0->'data'->'startTime'->'localTime' IS NOT NULL THEN 
      (completion_response->'orders'->0->'data'->'startTime'->'localTime')::text::timestamp with time zone
    
    -- Try completionDetails.data.startTime path
    WHEN completion_response->'completionDetails'->'data'->'startTime'->'localTime' IS NOT NULL THEN 
      (completion_response->'completionDetails'->'data'->'startTime'->'localTime')::text::timestamp with time zone
    
    -- If no localTime is found, try the same paths with utcTime
    WHEN completion_response->'data'->'startTime'->'utcTime' IS NOT NULL THEN 
      (completion_response->'data'->'startTime'->'utcTime')::text::timestamp with time zone
    
    WHEN completion_response->'orders'->0->'data'->'startTime'->'utcTime' IS NOT NULL THEN 
      (completion_response->'orders'->0->'data'->'startTime'->'utcTime')::text::timestamp with time zone
    
    WHEN completion_response->'completionDetails'->'data'->'startTime'->'utcTime' IS NOT NULL THEN 
      (completion_response->'completionDetails'->'data'->'startTime'->'utcTime')::text::timestamp with time zone
    
    -- Try data paths with underscores (start_time instead of startTime)
    WHEN completion_response->'data'->'start_time'->'localTime' IS NOT NULL THEN 
      (completion_response->'data'->'start_time'->'localTime')::text::timestamp with time zone
    
    WHEN completion_response->'orders'->0->'data'->'start_time'->'localTime' IS NOT NULL THEN 
      (completion_response->'orders'->0->'data'->'start_time'->'localTime')::text::timestamp with time zone
      
    ELSE NULL
  END
WHERE end_time IS NOT NULL 
  AND start_time IS NULL
  AND completion_response IS NOT NULL;

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
