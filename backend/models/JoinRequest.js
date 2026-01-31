const mongoose = require("mongoose");

const JoinRequestSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  name: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("JoinRequest", JoinRequestSchema);
