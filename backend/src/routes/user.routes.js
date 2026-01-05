import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  loginUser,
  logoutUser,
  registerUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";

const router = Router();

// ================ public routes ================

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/refresh-access-token").get(refreshAccessToken);

// ================ protected routes ================

// --- Authentication & Security ---

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changePassword);

// --- Current User Profile Management ---

router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/update-profile").patch(verifyJWT, updateUserProfile);

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// --- Channel & Data Aggregation ---

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
