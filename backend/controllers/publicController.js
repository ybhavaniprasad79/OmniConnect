const Workspace = require("../models/Workspace");
const JoinRequest = require("../models/JoinRequest");

// Default country code (India)
const DEFAULT_COUNTRY_CODE = "+91";

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

const normalizeNumber = (input, countryCode) => {
  if (!input) return "";

  // Clean input: keep only digits and +
  let num = String(input)
    .trim()
    .replace(/[^\d+]/g, "");

  // If already full E.164 (+...), trust it as-is
  if (num.startsWith("+")) return num;

  // If explicit country code provided, build from that
  if (countryCode) {
    let cc = String(countryCode)
      .trim()
      .replace(/[^\d+]/g, "");
    if (!cc.startsWith("+")) cc = "+" + cc;
    return cc + num;
  }

  // Otherwise, fall back to default +91 logic
  if (num.length === 10) {
    return DEFAULT_COUNTRY_CODE + num;
  }
  if (num.length > 10) {
    return "+" + num;
  }
  return DEFAULT_COUNTRY_CODE + num;
};

const submitJoinRequest = async (req, res) => {
  const {
    workspaceId,
    name,
    whatsappNumber,
    phoneNumber,
    whatsappCountry,
    phoneCountry,
    email,
  } = req.body;
  if (!workspaceId || !name || !whatsappNumber)
    return res.status(400).json({ error: "Missing fields" });
  try {
    const normalizedWhatsApp = normalizeNumber(whatsappNumber, whatsappCountry);
    const normalizedPhone = normalizeNumber(phoneNumber, phoneCountry);

    console.log("[Join Request] Received:");
    console.log("  whatsappNumber (input):", whatsappNumber);
    console.log("  phoneNumber (input):", phoneNumber);
    console.log("  whatsappCountry:", whatsappCountry);
    console.log("  phoneCountry:", phoneCountry);
    console.log("[Join Request] Normalized:");
    console.log("  whatsappNumber:", normalizedWhatsApp);
    console.log("  phoneNumber:", normalizedPhone);

    const jr = await JoinRequest.create({
      workspace: workspaceId,
      name,
      whatsappNumber: normalizedWhatsApp,
      phoneNumber: normalizedPhone,
      email,
    });
    res.json(jr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { searchWorkspaces, submitJoinRequest };
