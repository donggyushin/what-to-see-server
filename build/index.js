"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _routes = require("./routes");

var _routes2 = _interopRequireDefault(_routes);

var _mysql = require("./db/mysql");

var _mysql2 = _interopRequireDefault(_mysql);

var _expressSession = require("express-session");

var _expressSession2 = _interopRequireDefault(_expressSession);

var _mysqlstoreopts = require("./options/mysqlstoreopts");

var _mysqlstoreopts2 = _interopRequireDefault(_mysqlstoreopts);

var _dotenv = require("dotenv");

var _dotenv2 = _interopRequireDefault(_dotenv);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _path = require("path");

var _connectFlash = require("connect-flash");

var _connectFlash2 = _interopRequireDefault(_connectFlash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MySQLStore = require("express-mysql-session")(_expressSession2.default);


_dotenv2.default.config();

var app = (0, _express2.default)();
var port = 8081;

var sessionStore = new MySQLStore(_mysqlstoreopts2.default);

//static file, folder

//middleware
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));
app.use((0, _expressSession2.default)({
  key: process.env.SESSION_KEY,
  secret: process.env.SESSION_SECRETKEY,
  store: sessionStore,
  resave: false,
  saveUninitialized: true
}));
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());
app.use((0, _connectFlash2.default)());

//router
app.use("/", _express2.default.static(__dirname + "/../../what-to-see-client/build"));
app.use("/api", _routes2.default);

app.get("/", function (req, res) {
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

app.listen(port, function () {
  console.log("what-to-see-server listening at ", port);
});