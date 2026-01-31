require("dotenv").config();
const connectDB = require("../config/db");
const Workspace = require("../models/Workspace");
const Member = require("../models/Member");

// Usage: node tests/add_member.js [workspaceId|workspaceName] [whatsappNumber]
const arg = process.argv[2];
const number = process.argv[3] || "8869965959";

const run = async () => {
  await connectDB();
  let workspace = null;
  if (!arg) {
    // try to find a workspace named 'Test Workspace' or first workspace
    workspace =
      (await Workspace.findOne({ name: "Test Workspace" })) ||
      (await Workspace.findOne());
    if (!workspace) {
      console.error(
        "No workspace found. Create a workspace first or pass workspaceId as first arg.",
      );
      process.exit(1);
    }
  } else {
    // try by id first then by name
    workspace = await Workspace.findById(arg).catch(() => null);
    if (!workspace) workspace = await Workspace.findOne({ name: arg });
    if (!workspace) {
      console.error("Workspace not found for:", arg);
      process.exit(1);
    }
  }

  const existing = await Member.findOne({
    workspace: workspace._id,
    whatsappNumber: { $in: [number, `+91${number}`, `+${number}`] },
  });
  if (existing) {
    console.log(
      "Member already exists:",
      existing._id.toString(),
      existing.name,
      existing.whatsappNumber,
    );
    process.exit(0);
  }

  const m = await Member.create({
    workspace: workspace._id,
    name: "Manual Member",
    whatsappNumber: number,
    phoneNumber: number,
    email: "",
  });
  console.log(
    "Created member:",
    m._id.toString(),
    m.name,
    m.whatsappNumber,
    "workspace:",
    workspace._id.toString(),
  );
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
