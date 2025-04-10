-- Check how many reports have start_time data
SELECT COUNT(*) AS reports_with_start_time 
FROM reports 
WHERE start_time IS NOT NULL;

-- Check how many reports have end_time data for comparison
SELECT COUNT(*) AS reports_with_end_time 
FROM reports 
WHERE end_time IS NOT NULL;

-- Check a sample of reports with their fields
SELECT 
  order_no, 
  status, 
  start_time, 
  end_time, 
  notes, 
  address, 
  latitude, 
  longitude, 
  job_duration 
FROM reports 
WHERE end_time IS NOT NULL 
ORDER BY end_time DESC
LIMIT 10;

-- Check if any records have start_time but not end_time
SELECT COUNT(*) AS start_time_only
FROM reports 
WHERE start_time IS NOT NULL AND end_time IS NULL;

-- Check if any records have end_time but not start_time
SELECT COUNT(*) AS end_time_only
FROM reports 
WHERE end_time IS NOT NULL AND start_time IS NULL;
