require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const workspaceRoutes = require("./routes/workspaces");
const publicRoutes = require("./routes/public");
const announcementRoutes = require("./routes/announcements");

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) =>
  res.json({ ok: true, service: "OmniConnect Backend" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/announcements", announcementRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  console.log(`OmniConnect backend listening on port http://localhost:${PORT}`);
});
