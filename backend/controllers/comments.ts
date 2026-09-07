import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";
import customErrors from "../helper/customErrors";

const { NotFoundError, FieldRequiredError, ForbiddenError } = customErrors;
const {
  appendAuthorFollowers,
  findArticleBySlugOrFail,
  stampAuthor,
  PUBLIC_USER_ATTRIBUTES,
} = helpers;
const { Article, Comment, User } = models;

//? All Comments for Article
const allComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loggedUser } = req;
    const { slug } = req.params;

    const article = await findArticleBySlugOrFail(Article, slug as string);

    const comments = await article.getComments({
      include: [
        { model: User, as: "author", attributes: PUBLIC_USER_ATTRIBUTES },
      ],
    });

    for (const comment of comments) {
      await appendAuthorFollowers(loggedUser, comment);
    }

    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

//* Create Comment for Article
const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loggedUser } = req;

    const { body } = req.body.comment;
    if (!body) throw new FieldRequiredError("Comment body");

    const { slug } = req.params;
    const article = await findArticleBySlugOrFail(Article, slug as string);

    const comment = await Comment.create({
      body: body,
      articleId: article.id,
      userId: loggedUser.id,
    });

    await stampAuthor(loggedUser, comment);

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
};

//* Delete Comment for Article
const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loggedUser } = req;

    const { slug, commentId } = req.params;

    const article = await findArticleBySlugOrFail(Article, slug as string);

    const comment = await Comment.findByPk(commentId);
    if (!comment || comment.articleId !== article.id) {
      throw new NotFoundError("Comment");
    }

    if (loggedUser.id !== comment.userId) {
      throw new ForbiddenError("comment");
    }

    await comment.destroy();

    res.json({ message: { body: ["Comment deleted successfully"] } });
  } catch (error) {
    next(error);
  }
};

export = { allComments, createComment, deleteComment };
