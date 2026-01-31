const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/announcementController");

router.use(auth);

router.post("/", ctrl.createAnnouncement);
router.get("/workspace/:workspaceId", ctrl.listAnnouncements);

module.exports = router;
