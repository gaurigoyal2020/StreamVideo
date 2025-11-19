import express from "express";
import { upload } from "../config/multer.config.js";
import { uploadVideo } from "../controllers/video.controller.js";

const router = express.Router();

// POST /api/upload - Upload and process video
router.post("/upload", upload.single('file'), uploadVideo);

export default router;