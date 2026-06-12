import express from "express"
// import fetchMessages
import { getConversation } from "../controllers/fetchMessages.js";
const router = express.Router();


router.get('/messages',getConversation);

export default router