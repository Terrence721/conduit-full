import express from "express";
import profilesController from "../controllers/profiles";
import verifyToken from "../middleware/authentication";

const router = express.Router();
const { getProfile, followToggler } = profilesController;

//? Profile
router.get("/:username", verifyToken, getProfile);

//* Follow Profile
router.post("/:username/follow", verifyToken, followToggler);

//* Unfollow Profile
router.delete("/:username/follow", verifyToken, followToggler);

export = router;
