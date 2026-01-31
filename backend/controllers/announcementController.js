const Announcement = require("../models/Announcement");
const Member = require("../models/Member");
const DeliveryLog = require("../models/DeliveryLog");
const notificationService = require("../services/notificationService");

const createAnnouncement = async (req, res) => {
  const { workspaceId, title, message, kind, scheduledAt } = req.body;
  if (!workspaceId || !title || !message)
    return res.status(400).json({ error: "Missing fields" });
  try {
    const ann = await Announcement.create({
      workspace: workspaceId,
      title,
      message,
      kind: kind || "announcement",
      createdBy: req.user._id,
      scheduledAt,
    });

    // immediate dispatch (if not scheduled)
    if (!scheduledAt) {
      const members = await Member.find({ workspace: workspaceId });
      notificationService.dispatchAnnouncement(ann, members);
    }

    res.json(ann);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listAnnouncements = async (req, res) => {
  try {
    const list = await Announcement.find({
      workspace: req.params.workspaceId,
    }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createAnnouncement, listAnnouncements };
