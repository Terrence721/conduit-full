import express from "express";
import profilesController from "../controllers/profiles";
import authentication from "../middleware/authentication";

const router = express.Router();
const { verifyToken, requireAuth } = authentication;
const { getProfile, followToggler } = profilesController;

//? Profile
router.get("/:username", verifyToken, getProfile);

//* Follow Profile
router.post(
  "/:username/follow",
  verifyToken,
  requireAuth,
  followToggler("add"),
);

//* Unfollow Profile
router.delete(
  "/:username/follow",
  verifyToken,
  requireAuth,
  followToggler("remove"),
);

export = router;
