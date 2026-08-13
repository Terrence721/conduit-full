import express from "express";

const router = express.Router();
const verifyToken = require("../../middleware/authentication");
const { favoriteToggler } = require("../../controllers/favorites");

//* Favorite Article
router.post("/:slug/favorite", verifyToken, favoriteToggler);
//* Unfavorite Article
router.delete("/:slug/favorite", verifyToken, favoriteToggler);

export = router;
