"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _multer = require("multer");

var _multer2 = _interopRequireDefault(_multer);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _routes = require("./routes");

var _routes2 = _interopRequireDefault(_routes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

var port = 8080;
var upload = (0, _multer2.default)();
//static file, folder

//middleware
app.use(_bodyParser2.default.json());
app.use(_bodyParser2.default.urlencoded({ extended: true }));

//router
app.use("/api", _routes2.default);

app.listen(port, function () {
  console.log("what-to-see-server listening at ", port);
});