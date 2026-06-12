import Conversation from "../models/chatModel.js";

export const createConversation = async (req,res)=>{
    try {
    const conversation = await Conversation.create({
      title: "New Chat",
      messages: [],
    });
    console.log("conversation created");
    
    res.status(201).json(conversation);
  } catch (err) {
    res.status(500).json({
      message: "Error creating conversation",
    });
  }
}