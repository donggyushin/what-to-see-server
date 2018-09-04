import express from "express";
import multer from "multer";
const router = express.Router();
const upload = multer();

router.get("/", (req, res) => {
  return res.render("test");
});

router.post("/", upload.array(), (req, res) => {
  const test = req.body.test;
  console.log(test);
  return res.json({
    ok: true,
    error: null,
    status: 200,
    test: test
  });
});

export default router;
