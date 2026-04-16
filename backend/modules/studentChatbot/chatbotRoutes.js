const express = require("express");

const { verifyJWT, studentOnly } = require("../../middleware/auth");
const controller = require("./chatbotController");

const router = express.Router();

router.get("/", verifyJWT, studentOnly, controller.getChat);
router.post("/message", verifyJWT, studentOnly, controller.sendMessage);
router.delete("/messages", verifyJWT, studentOnly, controller.clearChat);

module.exports = router;
