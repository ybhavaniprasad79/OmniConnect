const express = require("express");
const router = express.Router();
const {
  searchWorkspaces,
  submitJoinRequest,
} = require("../controllers/publicController");

router.get("/search", searchWorkspaces);
router.post("/join", submitJoinRequest);

module.exports = router;
