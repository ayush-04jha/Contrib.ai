import axios from "axios";
import Conversation from "../models/chatModel.js";

export const chatHandler = (socket) => {

  socket.on("querry_sent", async (msg) => {
    try {
      console.log("query reached to server:", msg);
      console.log("conversationId:", msg.conversationId, "repoId:", msg.repoId);

      if (!msg.repoId) {
        socket.emit("error", { message: "Repo id is missing. Please analyze a repo first." });
        return;
      }

      // Ensure repoId is set on the conversation
      const updatedConversation = await Conversation.findByIdAndUpdate(
        msg.conversationId,
        {
          $set: { repoId: msg.repoId },
          $push: {
            messages: {
              sender: "user",
              text: msg.querry,
            },
          },
        },
        { returnDocument: 'after' }
      );
      console.log("Updated conversation with user message, repoId:", updatedConversation?.repoId);
      const response = await (axios.post(`${process.env.AI_ENGINE_URL || "http://localhost:8000"}/chat`, {
        querry: msg.querry,
        repo_id: msg.repoId
      }))
      await Conversation.findByIdAndUpdate(
        msg.conversationId,
        {
          $set: { repoId: msg.repoId },
          $push: {
            messages: {
              sender: "bot",
              text: response.data.answer,
            },
          },
        },
        { returnDocument: 'after' }
      );

      // send to frontend
      socket.emit("answer_received", {
        ai_response: response.data.answer
      });
    } catch (err) {
      console.error(err);
      socket.emit("error", { message: "Server error" });
    }

  })
  //


}

