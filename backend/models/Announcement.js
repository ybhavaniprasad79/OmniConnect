const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  kind: {
    type: String,
    enum: ["announcement", "event"],
    default: "announcement",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  scheduledAt: { type: Date },
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
