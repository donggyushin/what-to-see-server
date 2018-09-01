import express from "express";
import multer from "multer";
import mysql from "../db/mysql";
import sha256 from "sha256";

//passport.js import

import passport from "passport";
import LocalStrategy from "passport-local";

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

router.post(
  "/login/",
  upload.array(),
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureFlash: true
  })
);

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

export default router;
