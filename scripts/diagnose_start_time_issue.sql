
-- Script to diagnose why start_time isn't being populated correctly in reports table

-- First, check if we have reports with end_time but no start_time
SELECT COUNT(*) AS missing_start_time
FROM reports
WHERE end_time IS NOT NULL AND start_time IS NULL;

-- Look at a sample of reports with end_time but no start_time
SELECT order_no, 
       end_time
FROM reports
WHERE end_time IS NOT NULL AND start_time IS NULL
LIMIT 5;

-- Check work_orders table where completion_response actually exists
SELECT 
  order_no,
  -- Try all possible JSON paths for startTime
  completion_response->'orders'->0->'data'->'startTime'->'localTime' AS start_time_path1,
  completion_response->'data'->'startTime'->'localTime' AS start_time_path2,
  completion_response->'completionDetails'->'data'->'startTime'->'localTime' AS start_time_path3
FROM work_orders
WHERE completion_response IS NOT NULL
LIMIT 5;

-- Compare with a record from work_orders that has completion data
SELECT 
  order_no,
  completion_response->'orders'->0->'data'->'endTime'->'localTime' AS end_time,
  completion_response->'orders'->0->'data'->'startTime'->'localTime' AS start_time
FROM work_orders
WHERE completion_response IS NOT NULL
  AND completion_response->'orders'->0->'data'->'endTime'->'localTime' IS NOT NULL
LIMIT 1;
