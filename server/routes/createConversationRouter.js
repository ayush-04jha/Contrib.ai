import express from "express";
import { createConversation } from "../controllers/createConversation.js";

const router = express.Router();

router.post('/conversation',createConversation);

export default router