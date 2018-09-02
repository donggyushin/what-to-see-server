"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _mysql = require("../db/mysql");

var _mysql2 = _interopRequireDefault(_mysql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

//알림창 전체 삭제하기
router.delete("/", function (req, res) {
  var user = req.user;
  var id = user.id;

  var sql = "DELETE FROM notification WHERE you=?";
  var post = [id];
  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        error: "db error",
        status: 400
      });
    }
    return res.json({
      ok: true,
      status: 200,
      error: null
    });
  });
});

//알림을 확인했을때 checked를 표시해주기.
router.put("/", function (req, res) {
  var user = req.user;
  var id = user.id;

  var sql = "UPDATE notification SET checked=true WHERE you = ?";
  var post = [id];

  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        error: "db error",
        status: 400
      });
    }
    return res.json({
      ok: true,
      error: null,
      status: 200
    });
  });
});

router.get("/", function (req, res) {
  var user = req.user;
  var id = user.id;

  var sql = "SELECT * FROM notification WHERE you =?";
  var post = [id];
  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        error: "db error",
        status: 400
      });
    }
    var notifications = results;
    return res.json({
      ok: true,
      notifications: notifications
    });
  });
});

//읽지않은 알림이 몇개 있는지 불러오기
router.get("/count", function (req, res) {
  var user = req.user;
  var id = user.id;

  var sql = "SELECT COUNT(*) AS count FROM notification WHERE you=? and checked=?";
  var post = [id, 0];

  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        error: "db error",
        status: 400
      });
    }
    var count = results[0].count;
    return res.json({
      ok: true,
      count: count
    });
  });
});

exports.default = router;