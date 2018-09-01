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

var _sha = require("sha256");

var _sha2 = _interopRequireDefault(_sha);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require("passport-local");

var _passportLocal2 = _interopRequireDefault(_passportLocal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//passport.js import

var router = _express2.default.Router();
var upload = (0, _multer2.default)();

//passport serializer && deserializer

_passport2.default.serializeUser(function (user, done) {
  done(null, user.id);
});

_passport2.default.deserializeUser(function (id, done) {
  //유저찾기
  var sql = "SELECT * FROM user WHERE id=?";
  var post = [id];
  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      return done(err);
    }
    var user = results[0];
    done(err, user);
  });
});

//passport.js 로그인

_passport2.default.use(new _passportLocal2.default(function (username, password, done) {
  //유저찾기
  var EncryptedPassword = _sha2.default.x2(password);
  var sql = "SELECT * FROM user WHERE username=?";
  var post = [username];
  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return done(err);
    }

    //user가 존재하지 않을때,
    if (results.length === 0) {
      return done(null, false, { message: "Incorrect username. " });
    }

    //password가 틀릴때,
    var users_password = results[0].password;
    if (EncryptedPassword !== users_password) {
      return done(null, false, { message: "Incorrect password" });
    }

    var user = results[0];

    return done(null, user);
  });
}));

router.post("/login/", upload.array(), _passport2.default.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",
  failureFlash: true
}));

//로그인(test)
// router.post("/login/", upload.array(), (req, res) => {
//   const username = req.body.username;
//   const password = req.body.password;
//   const EncryptedPassword = sha256.x2(password);

//   //username으로 유저찾기
//   const sql = "SELECT password FROM user WHERE username = ?";
//   const post = [username];

//   mysql.query(sql, post, (err, results, fields) => {
//     if (err) {
//       console.log(err);
//       return res.json({
//         ok: false,
//         error: "db error",
//         status: 400
//       });
//     } else {
//       //유저가 없다면,
//       if (results.length === 0) {
//         return res.json({
//           ok: false,
//           error: "no user",
//           status: 400
//         });
//       }
//       //유저가 존재한다면,
//       const users_password = results[0].password;
//       //비밀번호가 일치하지 않는다면,
//       if (users_password !== EncryptedPassword) {
//         return res.json({
//           ok: false,
//           error: "wrong password",
//           status: 400
//         });
//       } else {
//         //성공
//         return res.json({
//           ok: true,
//           error: null,
//           status: 200
//         });
//       }
//     }
//   });
// });

//회원가입
router.post("/", upload.array(), function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var displayName = req.body.displayName;
  var EncryptedPassword = _sha2.default.x2(password);

  var sql = "INSERT INTO user (username, password, displayName) VALUES (?,?,?)";
  var post = [username, EncryptedPassword, displayName];

  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "There is username or displayName already"
      });
    } else {
      return res.json({
        ok: true,
        status: 200,
        error: null
      });
    }
  });
});

exports.default = router;