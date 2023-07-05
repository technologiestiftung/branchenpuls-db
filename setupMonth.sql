DROP TABLE IF EXISTS state_06_2023;
CREATE TABLE state_06_2023 (
  opendata_id TEXT,
  business_type INT,
  business_age INT,
  employees_range TEXT,
  
    latitude DECIMAL,
    longitude DECIMAL,
    postcode INT,
  ihk_branch_id INT,
  nace_id INT,
  branch_top_level_id INT,
  created_on DATE
);
DROP INDEX IF EXISTS opendata_id_index;
DROP INDEX IF EXISTS business_type_index;
DROP INDEX IF EXISTS business_age_index;
DROP INDEX IF EXISTS employees_range_index;
DROP INDEX IF EXISTS latitude_index;
DROP INDEX IF EXISTS longitude_index;
DROP INDEX IF EXISTS postcode_index;
DROP INDEX IF EXISTS ihk_branch_id_index;
DROP INDEX IF EXISTS nace_id_index;
DROP INDEX IF EXISTS branch_top_level_id_index;
DROP INDEX IF EXISTS created_on_index;


CREATE INDEX opendata_id_index ON state_06_2023 (opendata_id);
CREATE INDEX business_type_index ON state_06_2023 (business_type);
CREATE INDEX business_age_index ON state_06_2023 (business_age);
CREATE INDEX employees_range_index ON state_06_2023 (employees_range);
CREATE INDEX latitude_index ON state_06_2023 (latitude);
CREATE INDEX longitude_index ON state_06_2023 (longitude);
CREATE INDEX postcode_index ON state_06_2023 (postcode);
CREATE INDEX ihk_branch_id_index ON state_06_2023 (ihk_branch_id);
CREATE INDEX nace_id_index ON state_06_2023 (nace_id);
CREATE INDEX branch_top_level_id_index ON state_06_2023 (branch_top_level_id);
CREATE INDEX created_on_index ON state_06_2023 (created_on);



WITH b AS (
  SELECT *
  FROM business
WHERE updated_on >= '2023-06-01' AND created_on <= '2023-06-01'

),
branch_by_date AS (
  SELECT DISTINCT ON (opendata_id) *
  FROM branch
  WHERE created_on <= '2023-06-01'
  ORDER BY opendata_id, created_on DESC
),
location_by_date AS (
  SELECT DISTINCT ON (opendata_id) *
  FROM location
  WHERE created_on <= '2023-06-01'
  ORDER BY opendata_id, created_on DESC
),
employees_by_date AS (
  SELECT DISTINCT ON (opendata_id) *
  FROM employees
  WHERE created_on <= '2023-06-01'
  ORDER BY opendata_id, created_on DESC
)
INSERT INTO state_06_2023
SELECT b.opendata_id, b.business_type, b.business_age, e.employees_range, l.latitude,l.longitude, l.postcode, brd.ihk_branch_id, brn.nace_id, brn.branch_top_level_id, b.created_on
FROM b
INNER JOIN location_by_date AS l ON b.opendata_id = l.opendata_id
INNER JOIN employees_by_date AS e ON b.opendata_id = e.opendata_id
INNER JOIN branch_by_date AS brd ON b.opendata_id = brd.opendata_id
INNER JOIN branch_names AS brn ON brn.ihk_branch_id  = brd.ihk_branch_id 
