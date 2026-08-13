import express from "express";
import favoritesRoutes from "./articles/favorites";
import commentsRoutes from "./articles/comments";
import verifyToken from "../middleware/authentication";
import articlesController from "../controllers/articles";

const router = express.Router();
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
router.post("/", verifyToken, createArticle);
//* Feed
router.get("/feed", verifyToken, articlesFeed);
// Single Article by slug
router.get("/:slug", verifyToken, singleArticle);
//* Update Article
router.put("/:slug", verifyToken, updateArticle);
//* Delete Article
router.delete("/:slug", verifyToken, deleteArticle);

//> Favorites routes
router.use("/", favoritesRoutes);
//> Comments routes
router.use("/", commentsRoutes);

export = router;
