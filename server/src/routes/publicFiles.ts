// Simple public file server for /files/:filename and project files
import express from "express";
import path from "path";

const router = express.Router();

const localCopyPath = path.join(__dirname, "../../uploads/localCopyOfProject");
router.use("/localCopyOfProject", express.static(localCopyPath));

export default router;
