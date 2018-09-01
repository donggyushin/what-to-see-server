"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var option = {
  host: process.env.MYSQL_HOST,
  port: 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

exports.default = option;