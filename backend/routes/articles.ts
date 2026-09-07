import express from "express";
import favoritesRoutes from "./articles/favorites";
import commentsRoutes from "./articles/comments";
import authentication from "../middleware/authentication";
import articlesController from "../controllers/articles";

const router = express.Router();
const { verifyToken, requireAuth } = authentication;
const {
  allArticles,
  createArticle,
  singleArticle,
  updateArticle,
  deleteArticle,
  articlesFeed,
} = articlesController;

//? All Articles - by Author/by Tag/Favorited by user
router.get("/", verifyToken, allArticles);
//* Create Article
router.post("/", verifyToken, requireAuth, createArticle);
//* Feed
router.get("/feed", verifyToken, requireAuth, articlesFeed);
// Single Article by slug
router.get("/:slug", verifyToken, singleArticle);
//* Update Article
router.put("/:slug", verifyToken, requireAuth, updateArticle);
//* Delete Article
router.delete("/:slug", verifyToken, requireAuth, deleteArticle);

//> Favorites routes
router.use("/", favoritesRoutes);
//> Comments routes
router.use("/", commentsRoutes);

export = router;
