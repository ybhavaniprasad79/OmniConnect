const Workspace = require("../models/Workspace");
const JoinRequest = require("../models/JoinRequest");

const searchWorkspaces = async (req, res) => {
  const q = req.query.q || "";
  try {
    const results = await Workspace.find({
      name: { $regex: q, $options: "i" },
    }).limit(20);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const submitJoinRequest = async (req, res) => {
  const { workspaceId, name, whatsappNumber, phoneNumber, email } = req.body;
  if (!workspaceId || !name || !whatsappNumber)
    return res.status(400).json({ error: "Missing fields" });
  try {
    const jr = await JoinRequest.create({
      workspace: workspaceId,
      name,
      whatsappNumber,
      phoneNumber,
      email,
    });
    res.json(jr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { searchWorkspaces, submitJoinRequest };
