require("dotenv").config();
const connectDB = require("../config/db");
const Member = require("../models/Member");
const DeliveryLog = require("../models/DeliveryLog");

const target = process.argv[2] || "8869965959";

const run = async () => {
  await connectDB();
  // try multiple formats
  const patterns = [target, `+91${target}`, `+${target}`];
  console.log(
    "Searching for members with whatsappNumber matching:",
    patterns.join(", "),
  );
  const members = await Member.find({ whatsappNumber: { $in: patterns } });
  if (!members || members.length === 0) {
    // try regex
    const regex = new RegExp(target.replace(/[^0-9]/g, ""));
    const byRegex = await Member.find({ whatsappNumber: { $regex: regex } });
    if (!byRegex || byRegex.length === 0) {
      console.log("No members found for that number.");
      process.exit(0);
    }
  }

  const found = members.length
    ? members
    : await Member.find({ whatsappNumber: { $regex: new RegExp(target) } });
  for (const m of found) {
    console.log("\nMember:", m._id.toString(), m.name, m.whatsappNumber);
    const logs = await DeliveryLog.find({ member: m._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .populate("announcement");
    if (!logs || logs.length === 0) {
      console.log("  No delivery logs for this member.");
      continue;
    }
    for (const l of logs) {
      console.log(
        "  ",
        l.timestamp.toISOString(),
        "| channel:",
        l.channel,
        "| success:",
        l.success,
        "| announcement:",
        l.announcement && l.announcement.title,
      );
    }
  }
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
