import express from "express";
import test from "./test";
import auth from "./auth";
import comment from "./comment";
import notification from "./notification";
import star from "./star";
const router = express.Router();

router.use("/test", test);
router.use("/auth", auth);
router.use("/comment", comment);
router.use("/notification", notification);
router.use("/star", star);

export default router;
