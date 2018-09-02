import express from "express";
import mysql from "../db/mysql";
import multer from "multer";

const upload = multer();

const router = express.Router();

router.get("/:movieId", (req, res) => {
  const movieId = req.params.movieId;

  const sql = "SELECT score FROM star WHERE movie = ?";
  const post = [movieId];

  mysql.query(sql, post, (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({
        ok: false,
        status: 400,
        error: "db error"
      });
    }

    const counter = results.length;
    let sum = 0;
    results.forEach(result => {
      sum = sum + result.score;
    });
    const avg = sum / counter;
    const stringAvg = avg.toString();
    const beautyAvg = stringAvg.substr(0, 3);
    return res.json({
      ok: true,
      counter,
      beautyAvg
    });
  });
});

router.post("/:movieId", upload.array(), (req, res) => {
  const user = req.user;
  const writer = user.id;
  const movieId = req.params.movieId;
  const score = parseInt(req.body.score);

  const sql = "INSERT INTO star(writer, score, movie) VALUES (?,?,?)";
  const post = [writer, score, movieId];

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
