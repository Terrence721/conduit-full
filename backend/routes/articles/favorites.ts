import express from "express";
import authentication from "../../middleware/authentication";
import favoritesController from "../../controllers/favorites";

const router = express.Router();
const { verifyToken, requireAuth } = authentication;
const { favoriteToggler } = favoritesController;

//* Favorite Article
router.post(
  "/:slug/favorite",
  verifyToken,
  requireAuth,
  favoriteToggler("add"),
);
//* Unfavorite Article
router.delete(
  "/:slug/favorite",
  verifyToken,
  requireAuth,
  favoriteToggler("remove"),
);

export = router;
