"use strict";

require('dotenv').config();

const PORT        = process.env.PORT || 8080;
const ENV         = process.env.ENV || "development";
const express     = require("express");
const bodyParser  = require("body-parser");
const sass        = require("node-sass-middleware");
const app         = express();

const knexConfig  = require("./knexfile");
const knex        = require("knex")(knexConfig[ENV]);
const morgan      = require('morgan');
const knexLogger  = require('knex-logger');
//const mailgun     = require('./mailgun/mailgun');


// Seperated Routes for each Resource
const usersRoutes = require("./routes/users");
const notifyRoutes = require("./routes/notify");

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

// Log knex SQL queries to STDOUT as well
app.use(knexLogger(knex));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));

// Mount all resource routes
app.use("/api/users", usersRoutes(knex));
app.use("/notify", notifyRoutes());

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// Invitations Page
app.get("/invitations", (req, res) => {
  res.render("poll_invitations");
});

// Poll Confirmations Page
app.get("/confirm", (req, res) => {
  res.render("poll_invitations_confirm");
});

// Reponse Page
app.get("/response", (req, res) => {
  res.render("poll_answers");
});

// Results page
app.get("/results", (req, res) => {
  res.render("poll_results");
});

app.listen(PORT, () => {
  console.log("Example app listening on port " + PORT);
});
