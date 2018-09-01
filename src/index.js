import express from "express";
import bodyParser from "body-parser";
import routes from "./routes";
import mysql from "./db/mysql";
import session from "express-session";
var MySQLStore = require("express-mysql-session")(session);
import storeOption from "./options/mysqlstoreopts";
import dotenv from "dotenv";

dotenv.config();

const app = express();
let port = 8081;

const sessionStore = new MySQLStore(storeOption);

//static file, folder

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRETKEY,
    store: sessionStore,
    resave: false,
    saveUninitialized: true
  })
);

//router
app.use("/api", routes);

app.get("/", (req, res) => {
  const sql = "SHOW TABLES";
  mysql.query(sql, (err, results, fields) => {
    if (err) console.log(err);
    console.log(results);
  });
  req.session.test = 1;
  res.send("Hello world" + req.session.test);
});

app.listen(port, () => {
  console.log("what-to-see-server listening at ", port);
});
