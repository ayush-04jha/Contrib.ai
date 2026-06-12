import mongoose from "mongoose";
import User from "./userModel.js";
const conversationSchema = new mongoose.Schema(
  {
    chatId:{
       type: String
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // temporary done false
      index: true,
    },

    title: {
      type: String,
      default: "New conversation",
    },

    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "bot"],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;