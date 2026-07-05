import express from "express";
import { logout } from "../controllers/logoutController.js";
import { getUserRepos } from "../controllers/getUserRepos.js";
import { authMiddleware } from "../middilware/middilware.js";

const router = express.Router();

router.post("/auth/logout", logout);
router.get("/user/repos",authMiddleware, getUserRepos);

export default router;