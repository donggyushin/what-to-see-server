"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _multer = require("multer");

var _multer2 = _interopRequireDefault(_multer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();
var upload = (0, _multer2.default)();

router.get("/", function (req, res) {
  return res.json({
    ok: true,
    error: null,
    status: 200
  });
});

router.post("/", upload.array(), function (req, res) {
  var test = req.body.test;
  console.log(test);
  return res.json({
    ok: true,
    error: null,
    status: 200,
    test: test
  });
});

exports.default = router;