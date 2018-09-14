"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _multer = require("multer");

var _multer2 = _interopRequireDefault(_multer);

var _mysql = require("../db/mysql");

var _mysql2 = _interopRequireDefault(_mysql);

var _notification = require("../utils/notification");

var NotificationActions = _interopRequireWildcard(_notification);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var upload = (0, _multer2.default)();
var router = _express2.default.Router();

//대댓글 불러오기
router.get("/reply/:commentId", function (req, res) {
  var comment_id = req.params.commentId;

  var sql = "SELECT r.id, u.displayName, message FROM reply r JOIN user u ON r.writer = u.id WHERE r.comment = ?";
  var post = [comment_id];
  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }
    var replies = results;
    return res.json({
      ok: true,
      replies: replies
    });
  });
});

//댓글 불러오기
router.get("/:movieId", function (req, res) {
  var movie_id = req.params.movieId;

  var sql = "SELECT c.id AS id, u.displayName AS username, c.message AS message FROM comment c JOIN user u ON c.writer = u.id WHERE movie=?";
  var post = [movie_id];
  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        error: "db error",
        status: 400
      });
    }
    var comments = results;
    return res.json({
      ok: true,
      comments: comments
    });
  });
});

//대댓글 삭제하기
router.delete("/reply/:replyId", function (req, res) {
  var me = req.user;
  var replyId = req.params.replyId;

  //내가 적은 대댓글인지 확인하기
  var sql = "SELECT writer FROM reply WHERE id = ?";
  var post = [replyId];
  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }
    var replyUserId = results[0].writer;
    if (me.id !== replyUserId) {
      return res.json({
        ok: false,
        status: 400,
        error: "it's not yours"
      });
    }
    var sql = "DELETE FROM reply WHERE id = ?";
    var post = [replyId];
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
        ok: true,
        status: 200,
        error: null
      });
    });
  });
});

//댓글삭제하기
router.delete("/:commentId", function (req, res) {
  var commentId = req.params.commentId;
  var myId = req.user.id;

  //내가 적은 댓글인지 확인하기,

  var sql = "SELECT writer FROM comment WHERE id = ?";
  var post = [commentId];

  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }
    var IdToCheck = results[0].writer;
    if (myId !== IdToCheck) {
      return res.json({
        ok: false,
        status: 400,
        error: "it's not yours"
      });
    }

    var sql = "DELETE FROM comment WHERE id = ?";
    var post = [commentId];

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
        ok: true,
        status: 200,
        error: null
      });
    });
  });
});

//댓글에 댓글 적기
router.post("/reply/:commentId", upload.array(), function (req, res) {
  var user = req.user; //other
  var message = req.body.message;
  var commentId = req.params.commentId;

  var sql = "INSERT INTO reply(writer, comment, message) VALUES (?,?,?)";
  var post = [user.id, commentId, message];

  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }
    //대댓글을 생성하였으면, 알림 생성, other와 you가 필요한데, other는 있으므로,
    //you 만 구하면된다.

    var sql = "SELECT u.id  FROM comment c JOIN reply r ON c.id = r.comment JOIN user u ON c.writer = u.id WHERE c.id = ?";
    var post = [commentId];
    _mysql2.default.query(sql, post, function (err, results, fields) {
      if (err) {
        console.log(err);
        return res.json({
          ok: false,
          status: 400,
          error: "db error"
        });
      }
      var you = results[0].id;

      NotificationActions.createNotification(user.id, you);

      return res.json({
        ok: true,
        status: 200,
        error: null
      });
    });
  });
});

//댓글 적기
router.post("/:id", upload.array(), function (req, res) {
  var user = req.user;
  var message = req.body.message;
  var movie_id = req.params.id;

  var sql = "INSERT INTO comment (writer, movie, message) VALUES (?, ?, ?)";
  var post = [user.id, movie_id, message];

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
      ok: true,
      status: 200,
      error: null
    });
  });
});

exports.default = router;