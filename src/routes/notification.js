import express from "express";
import mysql from "../db/mysql";

const router = express.Router();

//알림창 전체 삭제하기
router.delete("/", (req, res) => {
  const user = req.user;
  const id = user.id;

  const sql = "DELETE FROM notification WHERE you=?";
  const post = [id];
  mysql.query(sql, post, (err, results, fields) => {
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
router.put("/", (req, res) => {
  const user = req.user;
  const id = user.id;

  const sql = "UPDATE notification SET checked=true WHERE you = ?";
  const post = [id];

  mysql.query(sql, post, (err, results, fields) => {
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

router.get("/", (req, res) => {
  const user = req.user;
  const id = user.id;

  const sql = "SELECT * FROM notification WHERE you =?";
  const post = [id];
  mysql.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        error: "db error",
        status: 400
      });
    }
    const notifications = results;
    return res.json({
      ok: true,
      notifications
    });
  });
});

//읽지않은 알림이 몇개 있는지 불러오기
router.get("/count", (req, res) => {
  const user = req.user;
  const id = user.id;

  const sql =
    "SELECT COUNT(*) AS count FROM notification WHERE you=? and checked=?";
  const post = [id, 0];

  mysql.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        error: "db error",
        status: 400
      });
    }
    const count = results[0].count;
    return res.json({
      ok: true,
      count
    });
  });
});

export default router;
