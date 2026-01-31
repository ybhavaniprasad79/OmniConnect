const mongoose = require("mongoose");

const DeliveryLogSchema = new mongoose.Schema({
  announcement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Announcement",
    required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  channel: { type: String, enum: ["whatsapp", "sms", "email"], required: true },
  success: { type: Boolean, required: true },
  response: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("DeliveryLog", DeliveryLogSchema);
