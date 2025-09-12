import express from "express";
import { StreamController } from "../controllers/stream.controller";

const router = express.Router();

router.post("/start", StreamController.startStream);
router.get("/stop", StreamController.stopStream);

export default router;
