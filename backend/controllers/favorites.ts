import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";
import customErrors from "../helper/customErrors";

const { UnauthorizedError, NotFoundError } = customErrors;
const { appendFollowers, appendFavorites, appendTagList } = helpers;
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

    const article = await Article.findOne({
      where: { slug: slug },
      include: [
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
      ],
    });
    if (!article) throw new NotFoundError("Article");

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
