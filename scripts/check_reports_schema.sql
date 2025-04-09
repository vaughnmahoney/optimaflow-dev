-- Check the schema of the reports table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'reports'
ORDER BY ordinal_position;
