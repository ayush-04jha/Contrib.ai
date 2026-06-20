import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./MongoDB/db.js";

import urlProcessingRouter from "./routes/urlProcessingRouter.js";
import messagesRouter from "./routes/messagesRouter.js";
import createConversationRouter from "./routes/createConversationRouter.js";
import { initSocket } from "./socket.js";
import repoIssuesRouter from "./routes/repoIssuesRouter.js"
import signupRouter from "./routes/signupRouter.js"
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

app.use("/api", urlProcessingRouter);
app.use("/api", messagesRouter);
app.use("/api", createConversationRouter);
app.use("/api", repoIssuesRouter);
app.use("/api",signupRouter)
initSocket(server);

const startServer = async () => {
  await connectDB(); 

  const port = 8080;

  server.listen(port, () => {
    console.log(
      `Server running on port ${port}`
    );
  });
};

startServer();