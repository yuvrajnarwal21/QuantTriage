import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema({
  title: String,
  brokenRule: String,
  severity: String,
  riskScore: Number,
  status: String,
  explanation: String,
  recommendedActions: [String],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Incident", incidentSchema);