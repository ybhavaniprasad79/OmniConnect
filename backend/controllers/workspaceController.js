const Workspace = require("../models/Workspace");
const JoinRequest = require("../models/JoinRequest");
const Member = require("../models/Member");

const createWorkspace = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name required" });
  try {
    const ws = await Workspace.create({
      name,
      description,
      manager: req.user._id,
    });
    res.json(ws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listWorkspacesForManager = async (req, res) => {
  try {
    const list = await Workspace.find({ manager: req.user._id });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getWorkspace = async (req, res) => {
  try {
    const ws = await Workspace.findById(req.params.id);
    if (!ws) return res.status(404).json({ error: "Workspace not found" });
    res.json(ws);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const pendingJoinRequests = async (req, res) => {
  try {
    const requests = await JoinRequest.find({
      workspace: req.params.id,
      status: "pending",
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listMembers = async (req, res) => {
  try {
    const members = await Member.find({ workspace: req.params.id });
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const acceptJoinRequest = async (req, res) => {
  try {
    const jr = await JoinRequest.findById(req.params.requestId);
    if (!jr) return res.status(404).json({ error: "Join request not found" });
    jr.status = "accepted";
    await jr.save();
    const member = await Member.create({
      workspace: jr.workspace,
      name: jr.name,
      whatsappNumber: jr.whatsappNumber,
      phoneNumber: jr.phoneNumber,
      email: jr.email,
    });
    res.json({ member });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rejectJoinRequest = async (req, res) => {
  try {
    const jr = await JoinRequest.findById(req.params.requestId);
    if (!jr) return res.status(404).json({ error: "Join request not found" });
    jr.status = "rejected";
    await jr.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createWorkspace,
  listWorkspacesForManager,
  getWorkspace,
  pendingJoinRequests,
  listMembers,
  acceptJoinRequest,
  rejectJoinRequest,
};
