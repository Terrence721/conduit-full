import express from "express";
import userController from "../controllers/user";

const router = express.Router();
const verifyToken = require("../middleware/authentication");
const { currentUser, updateUser } = userController;

//* Current User
router.get("/", verifyToken, currentUser);
//* Update User
router.put("/", verifyToken, updateUser);

export = router;
