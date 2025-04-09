
-- Script to diagnose why start_time isn't being populated correctly

-- First, check if we have reports with end_time but no start_time
SELECT COUNT(*) AS missing_start_time
FROM reports
WHERE end_time IS NOT NULL AND start_time IS NULL;

-- Look at a sample of completion_response for orders with end_time but no start_time
SELECT order_no, 
       end_time,
       completion_response
FROM reports
WHERE end_time IS NOT NULL AND start_time IS NULL
LIMIT 5;

-- Check paths where startTime might be located in the JSON structure
SELECT 
  order_no,
  end_time,
  -- Try all possible JSON paths for startTime
  completion_response->'data'->'startTime' AS path1,
  completion_response->'orders'->>0->'data'->'startTime' AS path2,
  completion_response->'orders'->0->'data'->'startTime' AS path3,
  completion_response->'completionDetails'->'data'->'startTime' AS path4
FROM reports
WHERE end_time IS NOT NULL AND start_time IS NULL
LIMIT 5;

-- Compare with a record that has both start_time and end_time
SELECT 
  order_no,
  start_time,
  end_time,
  completion_response
FROM reports
WHERE start_time IS NOT NULL AND end_time IS NOT NULL
LIMIT 1;
