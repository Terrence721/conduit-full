import express from "express";
import verifyToken from "../../middleware/authentication";
import commentsController from "../../controllers/comments";

const router = express.Router();
const { allComments, createComment, deleteComment } = commentsController;

//? All Comments for Article
router.get("/:slug/comments", verifyToken, allComments);
//* Create Comment for Article
router.post("/:slug/comments", verifyToken, createComment);
//* Delete Comment for Article
router.delete("/:slug/comments/:commentId", verifyToken, deleteComment);

export = router;
