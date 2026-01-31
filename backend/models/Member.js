const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  name: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  phoneNumber: { type: String },
  email: { type: String },
  joinedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Member", MemberSchema);
