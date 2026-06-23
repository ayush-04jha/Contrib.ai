import express from "express";
import { createConversation, getConversationByRepoId, getAllConversationsByRepoId } from "../controllers/createConversation.js";

const router = express.Router();

router.post('/conversation',createConversation);
router.get('/conversation/repo/:repoId', getConversationByRepoId);
router.get('/conversations/repo/:repoId', getAllConversationsByRepoId);

export default router