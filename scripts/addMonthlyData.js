// const request = require("request");
// const Papa = require("papaparse");
// const pgp = require("pg-promise")();
// const pLimit = require("p-limit");
// const limit = pLimit(50); // Limit to processing 5 rows concurrently
// const fs = require("fs");
// const path = require("path");
// const { getMonthTableQuery } = require("./lib/getMonthTableQuery");
// require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

import request from "request";
import Papa from "papaparse";
import pgPromise from "pg-promise";
import pLimit from "p-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // Import the fileURLToPath function
import { getMonthTableQuery } from "./lib/getMonthTableQuery.js";
import dotenv from "dotenv";

// Convert the current ES module's URL to a file path
const currentFilePath = fileURLToPath(import.meta.url);

// Use the path.dirname function to get the directory name
const currentDir = path.dirname(currentFilePath);

// Set the path for dotenv.config()
dotenv.config({ path: path.join(currentDir, "..", ".env") });

const pgp = pgPromise();
const limit = pLimit(50); // Limit to processing 50 rows concurrently

let db;
let wasError = false;

let now = new Date();
now.setMonth(now.getMonth() - 1); // Go to last month
let year = now.getFullYear();
let month = (now.getMonth() + 1).toString().padStart(2, "0"); // Ensure two digits

const clMonth = process?.argv[2];
const clYear = process?.argv[3];
let isLocal = clMonth && clYear ? true : false;

console.log("isLocal", isLocal, clMonth, clYear);

if (isLocal) {
  // change date here
  month = clMonth; // 07
  year = clYear; // 2023
}

// const dataLink = `https://media.githubusercontent.com/media/IHKBerlin/IHKBerlin_Gewerbedaten/master/archivedData/IHKBerlin_Gewerbedaten_${month}-${year}.csv`;
const dataLink = `https://media.githubusercontent.com/media/IHKBerlin/IHKBerlin_Gewerbedaten/master/data/IHKBerlin_Gewerbedaten.csv`;
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
  NULL: 15,
  null: 15,
};

function getMessage(i, startTime) {
  const nowTime = new Date();
  const timePasted = (nowTime - startTime) / 1000;
  const message = `Added row ${i} - Time past: ${timePasted}sec (${(
    timePasted.toFixed() / 60
  ).toFixed()} min)`;

  return message;
}
// Initialize the connection to your PostgreSQL database
// Change the connection details here
if (isLocal) {
  db = pgp({
    host: "localhost",
    port: 5433,
    database: "ihk_db",
    user: "postgres",
    password: "your_password",
  });
} else {
  db = pgp({
    host: process.env.SUPABASE_HOST,
    port: Number(process.env.SUPABASE_PORT),
    database: process.env.SUPABASE_DATABASE,
    user: process.env.SUPABASE_USER,
    password: process.env.SUPABASE_PASSWORD,
  });
}

if (isLocal) {
  const data = fs.readFileSync(
    path.join(
      currentDir,
      `/tempData/IHKBerlin_Gewerbedaten_${month}-${year}.csv`
    ),
    "utf-8"
  );
  readData(data, month, year);
} else {
  console.log("downloading data ...");
  request(dataLink, { json: true }, (err, res, body) => {
    if (err) {
      console.warn("err:", err);
    }
    if (!res.body) {
      console.warn("no res.body");
    }
    console.log("Data downloaded !");
    readData(res.body, month, year);
  });
}

function readData(data, month, year) {
  console.log("reading in data...");
  let parsedData = [];

  Papa.parse(data, {
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
          data[key] = "NULL";
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
      } else {
        console.log(
          "data not added becaue of missing coordinates or id: ",
          data?.opendata_id
        );
      }
    },
    complete: function () {
      console.log("Parsing complete", month, year);
      uploadToDB(parsedData, month, year);
    },
  });
}

function uploadToDB(data, month, year) {
  console.log("uploading data ... ");

  let startTime = new Date();
  // Function to handle each row
  async function handleRow(row, i) {
    //   get date from file name
    const dataDate = `${year}-${month}-01`;

    const businessType =
      row.business_type === "Kleingewerbetreibender"
        ? 0
        : row.business_type === "im Handelsregister eingetragen"
        ? 1
        : 2;

    const employeesRange =
      lookupEmployees[row.employees_range] !== undefined
        ? lookupEmployees[row.employees_range]
        : 15;

    let query = `
			-- add a business 
			INSERT INTO business (opendata_id,business_type,created_on)
			VALUES (${row.opendata_id},'${businessType}','${dataDate}')
			ON CONFLICT (opendata_id)
			DO NOTHING;

			-- update updated_on and business_age each time 
			UPDATE business
			SET updated_on = '${dataDate}', business_age = ${row.business_age}
			WHERE opendata_id = '${row.opendata_id}';

			-- the table save the employees range. If the employees_range changes (more or less employees), a new entry is added
			INSERT INTO employees (opendata_id, created_on, employees_range)
			SELECT '${row.opendata_id}', '${dataDate}','${employeesRange}'
			WHERE '${employeesRange}' NOT IN (SELECT employees_range FROM employees WHERE opendata_id = '${row.opendata_id}');

			-- the tables saves the branch for each business. If the branch type changes, a new enry is added with the same opendata_id
			INSERT INTO branch (opendata_id, created_on, ihk_branch_id)
			SELECT ${row.opendata_id}, '${dataDate}',${row.ihk_branch_id}
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

    try {
      await db.none(query);
      const message = getMessage(i, startTime);
      process.stdout.write(!wasError ? "\r" + message : message);
      wasError = false;
    } catch (err) {
      console.error(
        `Error executing query for id ${row.opendata_id}`,
        err.stack,
        query
      );
      wasError = true;
    }
  }

  // Main async function
  async function main() {
    try {
      console.log(`Starting processing of ${data.length} rows...`);
      // // Create an array of promises for all rows

      const promises = data.map((row, i) => {
        return limit(() => handleRow(row, i));
      });

      // Process all rows concurrently
      await Promise.all(promises);
      console.log("Finished processing all rows.");

      // finally create a table for the newly added month
      console.log("creating month table");
      const tableName = `state_${month}_${year}`;
      const fullDate = `'${year}-${month}-01'`;
      const monthTableQuery = getMonthTableQuery(tableName, fullDate);
      await db.none(monthTableQuery);
      console.log("ALL DONE");
    } catch (err) {
      console.error("Error in main function", err.stack);
    }
  }

  // Execute main function
  main();
}
