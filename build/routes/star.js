"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _mysql = require("../db/mysql");

var _mysql2 = _interopRequireDefault(_mysql);

var _multer = require("multer");

var _multer2 = _interopRequireDefault(_multer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var upload = (0, _multer2.default)();

var router = _express2.default.Router();

router.get("/:movieId", function (req, res) {
  var movieId = req.params.movieId;

  var sql = "SELECT score FROM star WHERE movie = ?";
  var post = [movieId];

  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }

    var counter = results.length;
    var sum = 0;
    results.forEach(function (result) {
      sum = sum + result.score;
    });
    var avg = sum / counter;
    var stringAvg = avg.toString();
    var beautyAvg = stringAvg.substr(0, 3);
    return res.json({
      ok: true,
      counter: counter,
      beautyAvg: beautyAvg
    });
  });
});

router.post("/:movieId", upload.array(), async function (req, res) {
  var user = req.user;
  var writer = user.id;
  var movieId = req.params.movieId;
  var score = parseInt(req.body.score);

  console.log("1");

  //만약 이미 평점을 매긴적이 있다면, 기존의 평점들을 모두 지워주자.

  var sql2 = "SELECT * FROM star WHERE movie = ? AND writer = ?";
  var post2 = [movieId, writer];

  await _mysql2.default.query(sql2, post2, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }

    if (results.length !== 0) {
      //만약에 결과값이 존재한다면,
      console.log("2");
      var sql = "DELETE FROM star WHERE movie = ? AND writer = ?";
      var post = [movieId, writer];
      _mysql2.default.query(sql, post, function (err, results, fields) {
        if (err) {
          console.log(err);
          return res.json({
            ok: false,
            status: 400,
            error: "db error"
          });
        }
        return res.json({
          ok: false,
          status: 200,
          error: "이미 평점을 매기셨습니다. 기존에 남겨주신 평점이 삭제되었습니다. "
        });
      });
    } else {
      console.log("3");

      var _sql = "INSERT INTO star(writer, score, movie) VALUES (?,?,?)";
      var _post = [writer, score, movieId];

      _mysql2.default.query(_sql, _post, function (err, results, fields) {
        if (err) {
          console.log(err);
          return res.json({
            ok: false,
            status: 400,
            error: "db error"
          });
        }

        return res.json({
          ok: true,
          status: 200,
          error: null
        });
      });
    }
  });

  // console.log("3");

  // const sql = "INSERT INTO star(writer, score, movie) VALUES (?,?,?)";
  // const post = [writer, score, movieId];

  // mysql.query(sql, post, (err, results, fields) => {
  //   if (err) {
  //     console.log(err);
  //     return res.json({
  //       ok: false,
  //       status: 400,
  //       error: "db error"
  //     });
  //   }

  //   return res.json({
  //     ok: true,
  //     status: 200,
  //     error: null
  //   });
  // });
});

exports.default = router;