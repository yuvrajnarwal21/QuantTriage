import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  type: String,
  severity: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Event", eventSchema);