import express from "express";
import authentication from "../../middleware/authentication";
import commentsController from "../../controllers/comments";

const router = express.Router();
const { verifyToken, requireAuth } = authentication;
const { allComments, createComment, deleteComment } = commentsController;

//? All Comments for Article
router.get("/:slug/comments", verifyToken, allComments);
//* Create Comment for Article
router.post("/:slug/comments", verifyToken, requireAuth, createComment);
//* Delete Comment for Article
router.delete(
  "/:slug/comments/:commentId",
  verifyToken,
  requireAuth,
  deleteComment,
);

export = router;
