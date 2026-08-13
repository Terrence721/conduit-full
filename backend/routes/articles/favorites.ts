import express from "express";
import verifyToken from "../../middleware/authentication";
import favoritesController from "../../controllers/favorites";

const router = express.Router();
const { favoriteToggler } = favoritesController;

//* Favorite Article
router.post("/:slug/favorite", verifyToken, favoriteToggler);
//* Unfavorite Article
router.delete("/:slug/favorite", verifyToken, favoriteToggler);

export = router;
