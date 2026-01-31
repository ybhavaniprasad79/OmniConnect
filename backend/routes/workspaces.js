const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/workspaceController");

router.use(auth);

router.post("/", controller.createWorkspace);
router.get("/", controller.listWorkspacesForManager);
router.get("/:id", controller.getWorkspace);
router.get("/:id/pending-joins", controller.pendingJoinRequests);
router.get("/:id/members", controller.listMembers);
router.post(
  "/:id/join-requests/:requestId/accept",
  controller.acceptJoinRequest,
);
router.post(
  "/:id/join-requests/:requestId/reject",
  controller.rejectJoinRequest,
);

module.exports = router;
