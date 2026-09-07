import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";
import customErrors from "../helper/customErrors";

const { UnauthorizedError } = customErrors;
const {
  appendFollowers,
  appendFavorites,
  appendTagList,
  findArticleBySlugOrFail,
} = helpers;
const { Article, Tag, User } = models;

//*  Favorite/Unfavorite Article
const favoriteToggler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const { slug } = req.params;

    const article = await findArticleBySlugOrFail(Article, slug as string, [
      {
        model: Tag,
        as: "tagList",
        attributes: ["name"],
      },
      {
        model: User,
        as: "author",
        attributes: ["username", "bio", "image" /* "following" */],
      },
    ]);

    if (req.method === "POST") await article.addUser(loggedUser);
    if (req.method === "DELETE") await article.removeUser(loggedUser);

    appendTagList(article.tagList, article);
    await appendFollowers(loggedUser, article);
    await appendFavorites(loggedUser, article);

    res.json({ article });
  } catch (error) {
    next(error);
  }
};

export = { favoriteToggler };
