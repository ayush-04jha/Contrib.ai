import express from "express"
import getRepoIssues from "../controllers/getRepoIssues.js";


const router = express.Router();



router.get("/issues/:jobId",getRepoIssues);

export default router;