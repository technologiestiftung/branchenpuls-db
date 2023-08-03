"use strict";

module.exports = { getMonthTableQuery };

function getMonthTableQuery(tableName, fullDate) {
  const query = `
    
    DROP TABLE IF EXISTS ${tableName};

    CREATE TABLE ${tableName} (
        opendata_id TEXT,
        business_type INT,
        business_age INT,
        employees_range TEXT,
        latitude DECIMAL,
        longitude DECIMAL,
        postcode INT,
        bezirk TEXT,
        planungsraum TEXT,
        bezirksregion TEXT,
        prognoseraum TEXT,
        ortsteil TEXT,
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
    DROP INDEX IF EXISTS bezirk_index;
    DROP INDEX IF EXISTS planungsraum_index;
    DROP INDEX IF EXISTS bezirksregion_index;
    DROP INDEX IF EXISTS prognoseraum_index;
    DROP INDEX IF EXISTS ortsteil_index;
    DROP INDEX IF EXISTS ihk_branch_id_index;
    DROP INDEX IF EXISTS nace_id_index;
    DROP INDEX IF EXISTS branch_top_level_id_index;
    DROP INDEX IF EXISTS created_on_index;

    CREATE INDEX opendata_id_index ON ${tableName} (opendata_id);
    CREATE INDEX business_type_index ON ${tableName} (business_type);
    CREATE INDEX business_age_index ON ${tableName} (business_age);
    CREATE INDEX employees_range_index ON ${tableName} (employees_range);
    CREATE INDEX latitude_index ON ${tableName} (latitude);
    CREATE INDEX longitude_index ON ${tableName} (longitude);
    CREATE INDEX postcode_index ON ${tableName} (postcode);
    CREATE INDEX bezirk_index ON ${tableName} (postcode);
    CREATE INDEX planungsraum_index ON ${tableName} (postcode);
    CREATE INDEX bezirksregion_index ON ${tableName} (postcode);
    CREATE INDEX prognoseraum_index ON ${tableName} (postcode);
    CREATE INDEX ortsteil_index ON ${tableName} (postcode);
    CREATE INDEX ihk_branch_id_index ON ${tableName} (ihk_branch_id);
    CREATE INDEX nace_id_index ON ${tableName} (nace_id);
    CREATE INDEX branch_top_level_id_index ON ${tableName} (branch_top_level_id);
    CREATE INDEX created_on_index ON ${tableName} (created_on);

    WITH b AS (
    SELECT *
    FROM business
    WHERE updated_on >= ${fullDate} AND created_on <= ${fullDate}
    ),
    branch_by_date AS (
    SELECT DISTINCT ON (opendata_id) *
    FROM branch
    WHERE created_on <= ${fullDate}
    ORDER BY opendata_id, created_on DESC
    ),
    location_by_date AS (
    SELECT DISTINCT ON (opendata_id) *
    FROM location
    WHERE created_on <= ${fullDate}
    ORDER BY opendata_id, created_on DESC
    ),
    employees_by_date AS (
    SELECT DISTINCT ON (opendata_id) *
    FROM employees
    WHERE created_on <= ${fullDate}
    ORDER BY opendata_id, created_on DESC
    )
    INSERT INTO ${tableName}
    SELECT b.opendata_id, b.business_type, b.business_age, e.employees_range, l.latitude,l.longitude, l.postcode, l.bezirk,l.planungsraum,l.bezirksregion,l.prognoseraum,l.ortsteil,brd.ihk_branch_id, brn.nace_id, brn.branch_top_level_id, b.created_on
    FROM b
    INNER JOIN location_by_date AS l ON b.opendata_id = l.opendata_id
    INNER JOIN employees_by_date AS e ON b.opendata_id = e.opendata_id
    LEFT JOIN branch_by_date AS brd ON b.opendata_id = brd.opendata_id
    LEFT JOIN branch_names AS brn ON brn.ihk_branch_id = brd.ihk_branch_id`;
  return query;
}
