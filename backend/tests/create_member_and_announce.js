require("dotenv").config();
const fetch = global.fetch || require("node-fetch");
const connectDB = require("../config/db");
const Member = require("../models/Member");

const base = "http://localhost:4000";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(path, opts) {
  const res = await fetch(base + path, opts);
  const text = await res.text();
  try {
    return { status: res.status, body: JSON.parse(text) };
  } catch (e) {
    return { status: res.status, body: text };
  }
}

async function run() {
  console.log("Waiting for server...");
  for (let i = 0; i < 20; i++) {
    try {
      const r = await req("/");
      if (r.status === 200) break;
    } catch (e) {}
    process.stdout.write(".");
    await wait(500);
  }

  // 1. create manager
  const email = `manager_${Date.now()}@example.com`;
  console.log("\nSignup manager:", email);
  let r = await req("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Auto Manager",
      email,
      password: "Password123!",
    }),
  });
  if (!r.body || !r.body.token) {
    console.error("Signup failed", r);
    process.exit(1);
  }
  const token = r.body.token;

  // 2. create workspace
  r = await req("/api/workspaces", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Auto Workspace",
      description: "Workspace for number test",
    }),
  });
  if (r.status !== 200) {
    console.error("Workspace create failed", r);
    process.exit(1);
  }
  const ws = r.body;
  console.log("Workspace created:", ws._id);

  // 3. connect DB and insert member
  await connectDB();
  const phone = "8869965959";
  const member = await Member.create({
    workspace: ws._id,
    name: "Direct Member",
    whatsappNumber: phone,
    phoneNumber: phone,
    email: "",
  });
  console.log("Member created:", member._id.toString(), member.whatsappNumber);

  // 4. create announcement via API
  r = await req("/api/announcements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      workspaceId: ws._id,
      title: "Test To User",
      message: "This is a live test message to your number.",
    }),
  });
  console.log("Announcement create:", r.status, r.body);

  console.log("\nDone. Check your WhatsApp/SMS/Email (mocked).");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
