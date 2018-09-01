import express from "express";
import multer from "multer";
import mysql from "../db/mysql";
import sha256 from "sha256";
import dotenv from "dotenv";

dotenv.config();

//passport.js import

import passport from "passport";
import LocalStrategy from "passport-local";
var FacebookStrategy = require("passport-facebook").Strategy;

const router = express.Router();
const upload = multer();

//passport serializer && deserializer

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  //유저찾기
  const sql = "SELECT * FROM user WHERE id=?";
  const post = [id];
  mysql.query(sql, post, (err, results, fields) => {
    if (err) {
      return done(err);
    }
    const user = results[0];
    done(err, user);
  });
});

//passport.js 로그인

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_SECRET_KEY,
      callbackURL: "/api/auth/facebook/callback"
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      const username = "facebook:" + profile.id;
      const displayName = profile.displayName;
      //이미 존재하는지 확인하기,
      const sql = "SELECT * FROM user WHERE username = ?";
      const post = [username];
      mysql.query(sql, post, (err, results, fields) => {
        if (err) {
          console.log(err);
          return done(err);
        }
        //이미 존재한다면
        if (results.length !== 0) {
          //바로 로그인 시켜주기
          const user = results[0];
          return done(null, user);
        } else {
          //존재하지 않는다면, 회원가입시켜주고, 로그인 시켜주기.
          const sql =
            "INSERT INTO user (username, password, displayName) VALUES(?,?,?)";
          const post = [username, "facebook", displayName];
          mysql.query(sql, post, (err, results, fields) => {
            if (err) {
              console.log(err);
              return done(err);
            }
            const sql = "SELECT * FROM user WHERE username = ?";
            const post = [username];
            mysql.query(sql, post, (err, results, fields) => {
              if (err) {
                console.log(err);
                return done(err);
              }
              const user = results[0];
              return done(null, user);
            });
          });
        }
      });
    }
  )
);

passport.use(
  new LocalStrategy((username, password, done) => {
    //유저찾기
    const EncryptedPassword = sha256.x2(password);
    const sql = "SELECT * FROM user WHERE username=?";
    const post = [username];
    mysql.query(sql, post, (err, results, fields) => {
      if (err) {
        console.log(err);
        return done(err);
      }

      //user가 존재하지 않을때,
      if (results.length === 0) {
        return done(null, false, { message: "Incorrect username. " });
      }

      //password가 틀릴때,
      const users_password = results[0].password;
      if (EncryptedPassword !== users_password) {
        return done(null, false, { message: "Incorrect password" });
      }

      const user = results[0];

      return done(null, user);
    });
  })
);

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback

router.get("/facebook", passport.authenticate("facebook"));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/"
  })
);

router.post(
  "/login",
  upload.array(),
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true
  })
);

//회원가입
router.post("/", upload.array(), (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const displayName = req.body.displayName;
  const EncryptedPassword = sha256.x2(password);

  const sql =
    "INSERT INTO user (username, password, displayName) VALUES (?,?,?)";
  const post = [username, EncryptedPassword, displayName];

  mysql.query(sql, post, (err, results, fields) => {
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
router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

export default router;
