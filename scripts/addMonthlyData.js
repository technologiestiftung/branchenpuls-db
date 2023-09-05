const request = require("request");
const Papa = require("papaparse");
const pgp = require("pg-promise")();
const fs = require("fs");
const path = require("path");
const { getMonthTableQuery } = require("./lib/getMonthTableQuery");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

let db;
let wasError = false;
const date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;
month = month.toString().length === 1 ? `0${month}` : `${month}`;

const clMonth = process?.argv[2];
const clYear = process?.argv[3];
let isLocal = clMonth && clYear ? true : false;

console.log("isLocal???", isLocal, process?.argv);
