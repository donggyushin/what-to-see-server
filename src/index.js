import express from "express";
import bodyParser from "body-parser";
import routes from "./routes";
import mysql from "./db/mysql";
import session from "express-session";
var MySQLStore = require("express-mysql-session")(session);
import storeOption from "./options/mysqlstoreopts";
import dotenv from "dotenv";
import passport from "passport";
import { dirname } from "path";

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
app.use(passport.initialize());
app.use(passport.session());

//router
app.use("/", express.static(__dirname + "/../../what-to-see-client/build"));
app.use("/api", routes);

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      message: "login"
    });
  } else {
    return res.json({
      message: "fail"
    });
  }
});

app.listen(port, () => {
  console.log("what-to-see-server listening at ", port);
});
