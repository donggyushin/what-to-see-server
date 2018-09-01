"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _test = require("./test");

var _test2 = _interopRequireDefault(_test);

var _auth = require("./auth");

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

router.use("/test", _test2.default);
router.use("/auth", _auth2.default);

exports.default = router;