const fs = require("fs");
const Papa = require("papaparse");
const pgp = require("pg-promise")();
const async = require("async");
const path = require("path");

// Initialize the connection to your PostgreSQL database
const db = pgp({
  host: "localhost",
  port: 5433,
  database: "ihk_db",
  user: "postgres",
  password: "your_password",
});

const lookupEmployees = {
  0: 0,
  "0 Beschäftigte": 0,
  "1 - 3 Beschäftigte": 1,
  "4 - 6 Beschäftigte": 2,
  "7 - 9 Beschäftigte": 3,
  "10 - 19 Beschäftigte": 4,
  "20 - 49 Beschäftigte": 5,
  "50 - 99 Beschäftigte": 6,
  "100 - 199 Beschäftigte": 7,
  "200 - 499 Beschäftigte": 8,
  "500 - 999 Beschäftigte": 9,
  "1000 - 2499 Beschäftigte": 10,
  "2500 - 4999 Beschäftigte": 11,
  "5000 - 7499 Beschäftigte": 12,
  "7500 - 9999 Beschäftigte": 13,
  "10000 und mehr Beschäftigte": 14,
  unbekannt: 15,
  // 99 = 'falsche Angabe'
};

//   const files = ["IHKBerlin_Gewerbedaten_06-2023.csv"];
const files = fs.readdirSync("./data");
async
  .eachOfSeries(files, function (fileName, i, callbackEach) {
    console.log("adding file: ", fileName);
    addCSV(fileName, callbackEach);
  })
  .then(() => {
    // Close database connection
    console.log("Database connection closed.");
    pgp.end();
    console.log("All DONE");
  });

function addCSV(fileName, callbackEach) {
  function readData(fileName) {
    const file = "./data/" + fileName;
    const fileData = fs.readFileSync(path.join(__dirname, file), "utf-8");
    let parsedData = [];

    Papa.parse(fileData, {
      header: true,
      dynamicTyping: true, // Enable automatic type conversion
      step: function (result) {
        let data = result.data;

        // make all key lowercase
        let lowerCaseObj = Object.keys(data).reduce((newObj, key) => {
          newObj[key.toLowerCase()] = data[key];
          return newObj;
        }, {});
        data = lowerCaseObj;

        // in case we have age saved as string: 100+
        if (data.business_age === "100+") {
          data.business_age = Number(
            data.business_age.toString().replace("+", "")
          );
        }

        for (const key in data) {
          let value = data[key];

          if (isNaN(value)) {
            // replace ' at start and end of string (bug in raw data)
            data[key] = value.replace(/'([^']*)'/g, function (match, p1) {
              return p1;
            });
          }
          if (value === undefined || value === "NULL") {
            data[key] = null;
          }
          if (Number(data[key]) && data[key] !== null) {
            data[key] = Number(data[key]);
          }
        }

        // only use data with a valid coordinate and an id
        if (
          Number(data.latitude) &&
          Number(data.longitude) &&
          !data.opendata_id !== null
        ) {
          data.latitude = Number(data.latitude.toFixed(5));
          data.longitude = Number(data.longitude.toFixed(5));
          parsedData.push(data);
        }
      },
      complete: function () {
        console.log("Parsing complete");
        uploadToDB(parsedData, fileName);
      },
    });
  }
  readData(fileName);

  function uploadToDB(data, fileName) {
    let startTime = new Date();
    // Function to handle each row
    async function handleRow(row, i) {
      try {
        //   get date from file name
        const fileNameDate = fileName.split("_")[2].split(".")[0].split("-");
        const dataMonth = fileNameDate[0];
        const dateYear = fileNameDate[1];
        const dataDate = `${dateYear}-${dataMonth}-01`;

        const businessType =
          row.business_type === "Kleingewerbetreibender"
            ? 0
            : row.business_type === "im Handelsregister eingetragen"
            ? 1
            : 2;

        const employeesRange =
          lookupEmployees[row.employees_range] !== undefined
            ? lookupEmployees[row.employees_range]
            : 99;

        const query = `
        -- add a business 
        INSERT INTO business (opendata_id,business_type,created_on)
        VALUES (${row.opendata_id},'${businessType}','${dataDate}')
        ON CONFLICT (opendata_id)
        DO NOTHING;

        -- update updated_on and business_age each time 
        UPDATE business
        SET updated_on = '${dataDate}', business_age = ${row.business_age}
        WHERE opendata_id = '${row.opendata_id}';

        -- the table save the employees range. If the employees_range chnages (more or less employees), a new entry is added
        INSERT INTO employees (opendata_id, created_on, employees_range)
        SELECT '${row.opendata_id}', '${dataDate}','${employeesRange}'
        WHERE '${employeesRange}' NOT IN (SELECT employees_range FROM employees WHERE opendata_id = '${row.opendata_id}');

        -- the tables saves the brnach for each business. If the brnach type chnages, a new enry is added with the same opendata_id
        INSERT INTO branch (opendata_id, created_on, ihk_branch_id)
        SELECT '${row.opendata_id}', '${dataDate}','${row.ihk_branch_id}'
        WHERE ${row.ihk_branch_id} NOT IN (SELECT ihk_branch_id FROM branch WHERE opendata_id = '${row.opendata_id}');

        -- add location data about a business if the lat lng do not already exist for that business
        INSERT INTO location (opendata_id,created_on,latitude,longitude,postcode,bezirk,planungsraum,bezirksregion,prognoseraum,ortsteil)
        SELECT '${row.opendata_id}', '${dataDate}','${row.latitude}','${row.longitude}','${row.postcode}','${row.bezirk}','${row.planungsraum}','${row.bezirksregion}','${row.prognoseraum}','${row.ortsteil}'
        WHERE
        ${row.latitude} NOT IN (SELECT latitude FROM location WHERE opendata_id = '${row.opendata_id}')
        AND
        ${row.longitude} NOT IN (SELECT longitude FROM location WHERE opendata_id = '${row.opendata_id}');

        -- insert branch names if not exists or if an update occured (like the name changed)
        INSERT INTO branch_names (ihk_branch_id,ihk_branch_desc,nace_id,nace_desc,branch_top_level_id,branch_top_level_desc)
        VALUES (${row.ihk_branch_id}, '${row.ihk_branch_desc}',${row.nace_id},'${row.nace_desc}',${row.branch_top_level_id},'${row.branch_top_level_desc}')
        ON CONFLICT (ihk_branch_id) DO UPDATE
        SET
        ihk_branch_desc = COALESCE(EXCLUDED.ihk_branch_desc, branch_names.ihk_branch_desc),
        nace_id = COALESCE(EXCLUDED.nace_id, branch_names.nace_id),
        nace_desc = COALESCE(EXCLUDED.nace_desc, branch_names.nace_desc),
        branch_top_level_id = COALESCE(EXCLUDED.branch_top_level_id, branch_names.branch_top_level_id),
        branch_top_level_desc = COALESCE(EXCLUDED.branch_top_level_desc, branch_names.branch_top_level_desc);
        
        `;

        //   console.log(`Processing row ${i}...`);
        await db.none(query);
        const nowTime = new Date();
        const timePasted = (nowTime - startTime) / 1000;
        console.log(
          `Done row ${i}`,
          `with file: ${fileNameDate} `,
          timePasted + " sec",
          " ",
          (timePasted.toFixed() / 60).toFixed() + " min"
        );
      } catch (err) {
        console.error(`Error executing query for row ${i}`, err.stack);
      }
    }

    // Main async function
    async function main() {
      try {
        console.log(`Starting processing of ${data.length} rows...`);

        // Create an array of promises for all rows
        let promises = data.map((row, i) => handleRow(row, i));

        // Process all rows concurrently
        await Promise.all(promises);
        console.log("Finished processing all rows.");

        callbackEach();
      } catch (err) {
        console.error("Error in main function", err.stack);
      }
    }

    // Execute main function
    main();
  }
}
