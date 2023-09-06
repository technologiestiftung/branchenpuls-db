// This is a script which queries your db and writes a json that you can use for the dropdowns in your frontend

const pgp = require("pg-promise")();
const fs = require("fs");

// Initialize the connection to your PostgreSQL database
const db = pgp({
  host: "localhost",
  port: 5433,
  database: "ihk_db",
  user: "postgres",
  password: "your_password",
});

// select branch data
db.any(
  `
  SELECT 
  ihk_branch_id,
    ihk_branch_desc ,
    nace_id ,
    nace_desc ,
    branch_top_level_id,
    branch_top_level_desc 
  FROM branch_names 
  WHERE nace_id != 0
  `
)
  .then((rows) => {
    fs.writeFile(`./branchKeys.json`, JSON.stringify(rows), function (err) {
      console.log("all done");
    });
    pgp.end();
  })
  .catch((err) => {
    console.error("Error executing query", err.stack);
  });
