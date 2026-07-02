import express from "express"
import getRepoIssues from "../controllers/getRepoIssues.js";
import { authMiddleware } from "../middilware/middilware.js";


const router = express.Router();



router.get("/issues/:jobId", authMiddleware, getRepoIssues);

export default router;