
-- Script to calculate and populate job_duration from start_time and end_time

-- Check if job_duration column exists 
SELECT 
  column_name, 
  data_type
FROM 
  information_schema.columns
WHERE 
  table_name = 'reports'
  AND column_name = 'job_duration';

-- If the column doesn't exist, you'll need to add it first
-- ALTER TABLE reports ADD COLUMN job_duration interval;

-- Update job_duration based on end_time and start_time
UPDATE reports
SET job_duration = (end_time - start_time)
WHERE 
  start_time IS NOT NULL 
  AND end_time IS NOT NULL
  AND (job_duration IS NULL OR job_duration = '00:00:00'::interval);

-- Check records with calculated job_duration
SELECT 
  order_no,
  start_time,
  end_time,
  job_duration,
  EXTRACT(EPOCH FROM job_duration)/60 AS duration_minutes
FROM reports
WHERE job_duration IS NOT NULL
ORDER BY job_duration DESC
LIMIT 10;

-- Get statistics on job_duration
SELECT 
  COUNT(*) AS total_records,
  COUNT(job_duration) AS records_with_duration,
  AVG(EXTRACT(EPOCH FROM job_duration)/60) AS avg_duration_minutes,
  MIN(job_duration) AS min_duration,
  MAX(job_duration) AS max_duration
FROM reports
WHERE job_duration IS NOT NULL;
