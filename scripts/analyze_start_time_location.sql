
-- Script to analyze exactly where startTime is located in the completion_response structure

-- First, let's look at a few work orders with completion data
SELECT 
  order_no,
  id
FROM work_orders
WHERE completion_response IS NOT NULL
LIMIT 5;

-- Now let's check various possible paths where startTime might be located
-- This query will examine multiple possible paths and show which ones contain data
SELECT 
  order_no,
  -- Check direct startTime path
  completion_response->'startTime' IS NOT NULL AS has_direct_startTime,
  -- Check data.startTime path
  completion_response->'data'->'startTime' IS NOT NULL AS has_data_startTime,
  -- Check orders array path
  jsonb_array_length(COALESCE(completion_response->'orders', '[]'::jsonb)) > 0 AS has_orders_array,
  CASE 
    WHEN jsonb_array_length(COALESCE(completion_response->'orders', '[]'::jsonb)) > 0 
    THEN completion_response->'orders'->0->'data'->'startTime' IS NOT NULL 
    ELSE false
  END AS has_orders_startTime,
  -- Check form data path
  completion_response->'data'->'form'->'startTime' IS NOT NULL AS has_form_startTime,
  
  -- Show the actual values if they exist (to validate time format)
  completion_response->'startTime'->'localTime' AS direct_startTime_local,
  completion_response->'data'->'startTime'->'localTime' AS data_startTime_local,
  CASE 
    WHEN jsonb_array_length(COALESCE(completion_response->'orders', '[]'::jsonb)) > 0 
    THEN completion_response->'orders'->0->'data'->'startTime'->'localTime'
    ELSE NULL
  END AS orders_startTime_local,
  completion_response->'data'->'form'->'startTime' AS form_startTime
FROM 
  work_orders
WHERE 
  completion_response IS NOT NULL
  -- Limit to completed orders to focus on ones that should have startTime
  AND (completion_response->>'status' = 'success' OR completion_response->'data'->>'status' = 'success')
LIMIT 20;

-- Let's count how many records have startTime in each location
SELECT
  COUNT(*) AS total_with_completion,
  SUM(CASE WHEN completion_response->'startTime' IS NOT NULL THEN 1 ELSE 0 END) AS count_direct_startTime,
  SUM(CASE WHEN completion_response->'data'->'startTime' IS NOT NULL THEN 1 ELSE 0 END) AS count_data_startTime,
  SUM(CASE WHEN jsonb_array_length(COALESCE(completion_response->'orders', '[]'::jsonb)) > 0 
           AND completion_response->'orders'->0->'data'->'startTime' IS NOT NULL THEN 1 ELSE 0 END) AS count_orders_startTime,
  SUM(CASE WHEN completion_response->'data'->'form'->'startTime' IS NOT NULL THEN 1 ELSE 0 END) AS count_form_startTime
FROM
  work_orders
WHERE
  completion_response IS NOT NULL;

-- Look for any records where startTime exists in reports but not in the expected paths in work_orders
SELECT
  r.order_no,
  r.start_time,
  wo.id,
  wo.completion_response->'startTime' IS NOT NULL AS has_direct_startTime,
  wo.completion_response->'data'->'startTime' IS NOT NULL AS has_data_startTime,
  jsonb_array_length(COALESCE(wo.completion_response->'orders', '[]'::jsonb)) > 0 AS has_orders_array
FROM
  reports r
JOIN
  work_orders wo ON r.order_no = wo.order_no
WHERE
  r.start_time IS NOT NULL
  AND wo.completion_response IS NOT NULL
  AND wo.completion_response->'startTime' IS NULL
  AND wo.completion_response->'data'->'startTime' IS NULL
  AND (jsonb_array_length(COALESCE(wo.completion_response->'orders', '[]'::jsonb)) = 0 
       OR wo.completion_response->'orders'->0->'data'->'startTime' IS NULL)
  AND wo.completion_response->'data'->'form'->'startTime' IS NULL
LIMIT 10;
