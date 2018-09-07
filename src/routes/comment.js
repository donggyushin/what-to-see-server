import express from "express";
import multer from "multer";
import mysql from "../db/mysql";
import * as NotificationActions from "../utils/notification";

const upload = multer();
const router = express.Router();

//대댓글 불러오기
router.get("/reply/:commentId", (req, res) => {
  const comment_id = req.params.commentId;

  const sql =
    "SELECT r.id, u.displayName, message FROM reply r JOIN user u ON r.writer = u.id WHERE r.comment = ?";
  const post = [comment_id];
  mysql.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }
    const replies = results;
    return res.json({
      ok: true,
      replies
    });
  });
});

//댓글 불러오기
router.get("/:movieId", (req, res) => {
  const movie_id = req.params.movieId;

  const sql = `SELECT c.id AS id, u.displayName AS username, c.message AS message FROM comment c JOIN user u ON c.writer = u.id WHERE movie=?`;
  const post = [movie_id];
  mysql.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        error: "db error",
        status: 400
      });
    }
    const comments = results;
    return res.json({
      ok: true,
      comments
    });
  });
});

//대댓글 삭제하기
router.delete("/reply/:replyId", (req, res) => {
  const me = req.user;
  const replyId = req.params.replyId;

  //내가 적은 대댓글인지 확인하기
  const sql = "SELECT writer FROM reply WHERE id = ?";
  const post = [replyId];
  mysql.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }
    const replyUserId = results[0].writer;
    if (me.id !== replyUserId) {
      return res.json({
        ok: false,
        status: 400,
        error: "it's not yours"
      });
    }
    const sql = "DELETE FROM reply WHERE id = ?";
    const post = [replyId];
    mysql.query(sql, post, (err, results, fields) => {
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
router.delete("/:commentId", (req, res) => {
  const commentId = req.params.commentId;
  const myId = req.user.id;

  //내가 적은 댓글인지 확인하기,

  const sql = "SELECT writer FROM comment WHERE id = ?";
  const post = [commentId];

  mysql.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }
    const IdToCheck = results[0].writer;
    if (myId !== IdToCheck) {
      return res.json({
        ok: false,
        status: 400,
        error: "it's not yours"
      });
    }

    const sql = "DELETE FROM comment WHERE id = ?";
    const post = [commentId];

    mysql.query(sql, post, (err, results, fields) => {
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
router.post("/reply/:commentId", upload.array(), (req, res) => {
  const user = req.user; //other
  const message = req.body.message;
  const commentId = req.params.commentId;

  const sql = "INSERT INTO reply(writer, comment, message) VALUES (?,?,?)";
  const post = [user.id, commentId, message];

  mysql.query(sql, post, (err, results, fields) => {
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

    const sql =
      "SELECT u.id  FROM comment c JOIN reply r ON c.id = r.comment JOIN user u ON c.writer = u.id WHERE c.id = ?";
    const post = [commentId];
    mysql.query(sql, post, (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({
          ok: false,
          status: 400,
          error: "db error"
        });
      }
      const you = results[0].id;

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
router.post("/:id", upload.array(), (req, res) => {
  const user = req.user;
  const message = req.body.message;
  const movie_id = req.params.id;

  const sql = "INSERT INTO comment (writer, movie, message) VALUES (?, ?, ?)";
  const post = [user.id, movie_id, message];

  mysql.query(sql, post, (err, results, fields) => {
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

export default router;
