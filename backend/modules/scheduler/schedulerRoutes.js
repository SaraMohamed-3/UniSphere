const express = require("express");
const { verifyJWT, adminOnly } = require("../../middleware/auth");
const controller = require("./schedulerController");

const router = express.Router();

router.post("/ga", verifyJWT, adminOnly, controller.runGA);
router.post("/score", verifyJWT, adminOnly, controller.score);
router.get("/sample", verifyJWT, adminOnly, controller.sample);
router.get("/resources", verifyJWT, adminOnly, controller.resources);
router.post("/run-db", verifyJWT, adminOnly, controller.runDb);
router.post("/apply", verifyJWT, adminOnly, controller.apply);
router.get("/rooms", verifyJWT, adminOnly, controller.listRooms);
router.post("/rooms", verifyJWT, adminOnly, controller.createRoom);
router.delete("/rooms/:id", verifyJWT, adminOnly, controller.deleteRoom);
router.get("/time-slots", verifyJWT, adminOnly, controller.listTimeSlots);
router.post("/time-slots", verifyJWT, adminOnly, controller.createTimeSlot);
router.delete("/time-slots/:id", verifyJWT, adminOnly, controller.deleteTimeSlot);
router.get("/unavailability", verifyJWT, adminOnly, controller.listUnavailability);
router.post("/unavailability", verifyJWT, adminOnly, controller.createUnavailability);
router.delete("/unavailability/:id", verifyJWT, adminOnly, controller.deleteUnavailability);
router.get("/runs", verifyJWT, adminOnly, controller.listRuns);
router.get("/runs/:id", verifyJWT, adminOnly, controller.getRun);
router.post("/runs/:id/apply", verifyJWT, adminOnly, controller.applyRun);
router.post("/announce", verifyJWT, adminOnly, controller.announceSchedule);

module.exports = router;
