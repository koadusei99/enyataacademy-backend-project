const express = require("express");
const morgan = require('morgan');
var pg = require('pg');

const { registerUser } = require("./controllers/AuthController");
const app = express();
require('dotenv').config();
const port = 3000;



app.use(morgan('dev'));

var conString = process.env.DATABASE_URL;
var client = new pg.Client(conString);

client.connect(function (err) {
  if (err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT NOW() AS "theTime"', function (err, result) {
    if (err) {
      return console.error('error running query', err);
    }
    console.log(result.rows[0].theTime);
    console.log('DB Connected Successfully!');
    client.end();
  });
});
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", registerUser);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
