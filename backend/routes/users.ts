import express from "express";
import usersController from "../controllers/users";

const router = express.Router();
const { signUp, signIn } = usersController;

// Register
router.post("/", signUp);
// Login
router.post("/login", signIn);

export = router;
