-- Script to examine the structure of completion details in the API response

-- First, let's check if the reports table has the new columns
SELECT 
  column_name, 
  data_type
FROM 
  information_schema.columns
WHERE 
  table_name = 'reports'
  AND column_name IN ('notes', 'start_time', 'address', 'latitude', 'longitude', 'job_duration')
ORDER BY 
  column_name;

-- Let's examine the completion_response structure from a work order
SELECT 
  order_id,
  jsonb_pretty(completion_response) AS formatted_completion_response
FROM 
  work_orders
WHERE 
  completion_response IS NOT NULL
LIMIT 1;

-- Check if the structure matches what we're expecting in the edge function
SELECT 
  order_id,
  completion_response->'completionDetails'->'data'->'form'->>'note' AS note,
  completion_response->'completionDetails'->'data'->'startTime'->>'utcTime' AS start_time_utc,
  completion_response->'completionDetails'->'data'->'startTime'->>'localTime' AS start_time_local,
  completion_response->'completionDetails'->'data'->'endTime'->>'utcTime' AS end_time_utc,
  completion_response->'completionDetails'->'data'->'endTime'->>'localTime' AS end_time_local
FROM 
  work_orders
WHERE 
  completion_response IS NOT NULL
LIMIT 5;

-- Check if the search_response contains location data
SELECT 
  order_id,
  search_response->'data'->'location'->>'address' AS address,
  search_response->'data'->'location'->>'latitude' AS latitude,
  search_response->'data'->'location'->>'longitude' AS longitude
FROM 
  work_orders
WHERE 
  search_response IS NOT NULL
LIMIT 5;
