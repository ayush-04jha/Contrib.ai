import express from "express";
import { login } from "../controllers/loginController.js";
import { logout } from "../controllers/logoutController.js";
import { getUserRepos } from "../controllers/getUserRepos.js";

const router = express.Router();

router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/user/repos", getUserRepos);

export default router;