import { Router } from "express";
import { uploadClassCover } from "../controllers/upload.controller.js";
import { requireAdmin } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadRoutes = Router();

uploadRoutes.post(
  "/classes/:classId/cover",
  asyncHandler(requireAdmin),
  upload.single("cover"),
  asyncHandler(uploadClassCover)
);