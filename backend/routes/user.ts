import express from "express";
import userController from "../controllers/user";
import verifyToken from "../middleware/authentication";

const router = express.Router();
const { currentUser, updateUser } = userController;

//* Current User
router.get("/", verifyToken, currentUser);
//* Update User
router.put("/", verifyToken, updateUser);

export = router;
