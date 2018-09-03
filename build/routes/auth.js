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

var _dotenv = require("dotenv");

var _dotenv2 = _interopRequireDefault(_dotenv);

var _passport = require("passport");

var _passport2 = _interopRequireDefault(_passport);

var _passportLocal = require("passport-local");

var _passportLocal2 = _interopRequireDefault(_passportLocal);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv2.default.config();

//passport.js import

var FacebookStrategy = require("passport-facebook").Strategy;

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

_passport2.default.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_SECRET_KEY,
  callbackURL: "/api/auth/facebook/callback"
}, function (accessToken, refreshToken, profile, done) {
  console.log(profile);
  var username = "facebook:" + profile.id;
  var displayName = profile.displayName;
  //이미 존재하는지 확인하기,
  var sql = "SELECT * FROM user WHERE username = ?";
  var post = [username];
  _mysql2.default.query(sql, post, function (err, results, fields) {
    if (err) {
      console.log(err);
      return done(err);
    }
    //이미 존재한다면
    if (results.length !== 0) {
      //바로 로그인 시켜주기
      var user = results[0];
      return done(null, user);
    } else {
      //존재하지 않는다면, 회원가입시켜주고, 로그인 시켜주기.
      var _sql = "INSERT INTO user (username, password, displayName) VALUES(?,?,?)";
      var _post = [username, "facebook", displayName];
      _mysql2.default.query(_sql, _post, function (err, results, fields) {
        if (err) {
          console.log(err);
          return done(err);
        }
        var sql = "SELECT * FROM user WHERE username = ?";
        var post = [username];
        _mysql2.default.query(sql, post, function (err, results, fields) {
          if (err) {
            console.log(err);
            return done(err);
          }
          var user = results[0];
          return done(null, user);
        });
      });
    }
  });
}));

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

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback

router.get("/facebook", _passport2.default.authenticate("facebook"));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.

router.get("/facebook/callback", _passport2.default.authenticate("facebook", {
  successRedirect: "/",
  failureRedirect: "/"
}));

router.post("/login", upload.array(), _passport2.default.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/api/auth/fail",
  failureFlash: true
}));

router.get("/fail", function (req, res) {
  return res.json({
    ok: false,
    status: 404,
    error: "wrong access, please check your username and password again"
  });
});

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

//logout
router.get("/logout", function (req, res) {
  req.logOut();
  return res.json({
    ok: true,
    error: null,
    status: 200
  });
});

//유저가 로그인했는지 안했는지 확인하기
router.get("/check", function (req, res) {
  if (req.isAuthenticated()) {
    var user = req.user;
    return res.json({
      ok: true,
      error: null,
      status: 200,
      user: user
    });
  }

  return res.json({
    ok: false,
    error: "not logined",
    status: 404
  });
});

exports.default = router;