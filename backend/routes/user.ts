import express from "express";
import userController from "../controllers/user";
import authentication from "../middleware/authentication";

const router = express.Router();
const { verifyToken, requireAuth } = authentication;
const { currentUser, updateUser } = userController;

//* Current User
router.get("/", verifyToken, requireAuth, currentUser);
//* Update User
router.put("/", verifyToken, requireAuth, updateUser);

export = router;
