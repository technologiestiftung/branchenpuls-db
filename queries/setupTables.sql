-- addd business
DROP TABLE IF EXISTS business;
CREATE TABLE business (
    key SERIAL PRIMARY KEY,
    opendata_id TEXT UNIQUE,
    business_type INT,
    created_on DATE,
    updated_on DATE,
    business_age INT
);
CREATE INDEX business_index ON business (opendata_id);

-- info about the amount of employees of a business
DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
    key SERIAL PRIMARY KEY,
    opendata_id TEXT,
    created_on DATE,
    employees_range TEXT
);
CREATE INDEX employees_index ON employees (opendata_id);

-- info about the branches associated with a business
DROP TABLE IF EXISTS branch;
CREATE TABLE branch (
    key SERIAL PRIMARY KEY,
    opendata_id TEXT,
    created_on DATE,
    ihk_branch_id INT
);
CREATE INDEX branch_index ON branch (opendata_id);

-- info about all locations associated with a business
DROP TABLE IF EXISTS location;
CREATE TABLE location (
    key SERIAL PRIMARY KEY,
    opendata_id TEXT,
    created_on DATE,
    latitude DECIMAL,
    longitude DECIMAL,
    postcode INT,
    bezirk TEXT,
    planungsraum TEXT,
    bezirksregion TEXT,
    prognoseraum TEXT,
    ortsteil TEXT
);
CREATE INDEX location_index ON location (opendata_id);

-- all branch Names
DROP TABLE IF EXISTS branch_names;
CREATE TABLE branch_names (
    key SERIAL PRIMARY KEY,
    ihk_branch_id INT UNIQUE,
    ihk_branch_desc TEXT,
    nace_id INT,
    nace_desc TEXT,
    branch_top_level_id INT,
    branch_top_level_desc TEXT
);



-- all branch Names
DROP TABLE IF EXISTS lookup_business;
CREATE TABLE lookup_business (
    key SERIAL PRIMARY KEY,
    id INT UNIQUE,
    description TEXT
);
INSERT INTO lookup_business (id,description)
VALUES (0,'Kleingewerbetreibender');

INSERT INTO lookup_business (id,description)
VALUES (1,'im Handelsregister eingetragen');

INSERT INTO lookup_business (id,description)
VALUES (2,'falsche Angabe');


-- all branch Names
DROP TABLE IF EXISTS lookup_employees;
CREATE TABLE lookup_employees (
    key SERIAL PRIMARY KEY,
    id INT UNIQUE,
    description TEXT
);
INSERT INTO lookup_employees (id, description)
VALUES
(0, '0'),
(1, '1 - 3'),
(2, '4 - 6'),
(3, '7 - 9'),
(4, '10 - 19'),
(5, '20 - 49'),
(6, '50 - 99'),
(7, '100 - 199'),
(8, '200 - 499'),
(9, '500 - 999'),
(10, '1000 - 2499'),
(11, '2500 - 4999'),
(12, '5000 - 7499'),
(13, '7500 - 9999'),
(14, '10000+'),
(15, 'unbekannt'),
(99, 'falsche Angabe');






-- DELETE FROM employees;
-- DELETE FROM branch;
-- DELETE FROM location;
-- DELETE FROM branch_names;
-- DELETE FROM state_03_2023;
-- DELETE FROM state_04_2023;
-- DELETE FROM state_05_2023;
-- DELETE FROM state_06_2023;
-- DELETE FROM state_07_2023;
-- DELETE FROM state_08_2023;
-- DELETE FROM state_09_2023;
-- DELETE FROM business;

