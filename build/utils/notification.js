"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNotification = undefined;

var _mysql = require("../db/mysql");

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createNotification = exports.createNotification = function createNotification(other, you) {
  var sql = "INSERT INTO notification(other, you) VALUES (?,?)";
  var post = [other, you];

  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
    }
    console.log("Success");
  });
};