import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";

const { findArticleBySlugOrFail, decorateArticle, PUBLIC_USER_ATTRIBUTES } =
  helpers;
const { Article, Tag, User } = models;

//*  Favorite/Unfavorite Article
// Bound to "add"/"remove" at route-registration time (see
// routes/articles/favorites.ts) rather than re-deriving the action from
// req.method at request time -- the route already knows which verb it is.
const favoriteToggler =
  (action: "add" | "remove") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { loggedUser } = req;

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
          attributes: PUBLIC_USER_ATTRIBUTES,
        },
      ]);

      if (action === "add") await article.addFavoritingUser(loggedUser);
      else await article.removeFavoritingUser(loggedUser);

      await decorateArticle(loggedUser, article);

      res.json({ article });
    } catch (error) {
      next(error);
    }
  };

export = { favoriteToggler };
