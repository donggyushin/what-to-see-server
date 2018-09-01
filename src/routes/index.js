import express from "express";
import test from "./test";
import auth from "./auth";
import comment from "./comment";
const router = express.Router();

router.use("/test", test);
router.use("/auth", auth);
router.use("/comment", comment);

export default router;
