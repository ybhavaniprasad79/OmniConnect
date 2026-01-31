const base = "http://localhost:4000";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function req(path, opts) {
  const res = await fetch(base + path, opts);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch (e) {
    body = text;
  }
  return { status: res.status, body };
}

async function run() {
  console.log("Starting API tests against", base);

  // wait for server
  for (let i = 0; i < 10; i++) {
    try {
      const r = await req("/");
      if (r.status === 200) break;
    } catch (e) {}
    process.stdout.write(".");
    await wait(500);
  }
  console.log("\nCreating manager (signup)");
  const email = `manager${Date.now()}@example.com`;
  let r = await req("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test Manager",
      email,
      password: "Password123!",
    }),
  });
  console.log("signup:", r.status, r.body);
  if (!r.body || !r.body.token) {
    console.error("Signup failed, aborting tests");
    process.exit(1);
  }
  const token = r.body.token;

  console.log("Create workspace");
  r = await req("/api/workspaces", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Test Workspace",
      description: "Created by test",
    }),
  });
  console.log("create workspace:", r.status, r.body);
  const ws = r.body;

  console.log("Search public workspaces");
  r = await req("/api/public/search?q=Test", { method: "GET" });
  console.log(
    "search:",
    r.status,
    r.body && r.body.length ? `${r.body.length} results` : r.body,
  );

  console.log("Submit join request (public)");
  r = await req("/api/public/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workspaceId: ws._id,
      name: "Member One",
      whatsappNumber: "+1000000000",
      phoneNumber: "+1000000000",
      email: "member1@example.com",
    }),
  });
  console.log("join submit:", r.status, r.body);
  const jr = r.body;

  console.log("List pending join requests (manager)");
  r = await req(`/api/workspaces/${ws._id}/pending-joins`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("pending joins:", r.status, r.body);

  console.log("Accept join request");
  r = await req(`/api/workspaces/${ws._id}/join-requests/${jr._id}/accept`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log("accept:", r.status, r.body);

  console.log("Create announcement (triggers dispatch)");
  r = await req("/api/announcements", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      workspaceId: ws._id,
      title: "Test Announcement",
      message: "This is a test message",
    }),
  });
  console.log("announcement:", r.status, r.body);

  console.log("\nAPI tests completed");
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
