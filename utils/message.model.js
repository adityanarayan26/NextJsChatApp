import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const MessageSchema = new Schema({
  sender: { type: String, required: true }, // user id or username
  receiver: { type: String, required: true }, // user id or username
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },

});

const Message = models?.Message || model("Message", MessageSchema);
export default Message;