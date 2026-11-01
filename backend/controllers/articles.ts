import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";
import customErrors from "../helper/customErrors";

const {
  AlreadyTakenError,
  FieldRequiredError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} = customErrors;
const {
  appendFavorites,
  findArticleBySlugOrFail,
  decorateArticle,
  decorateArticles,
  parsePagination,
  slugify,
  stampAuthor,
  PUBLIC_USER_ATTRIBUTES,
} = helpers;
const { Article, Tag, User } = models;

const includeOptions = [
  { model: Tag, as: "tagList", attributes: ["name"] },
  { model: User, as: "author", attributes: PUBLIC_USER_ATTRIBUTES },
];

//? All Articles - by Author/by Tag/Favorites by user
const allArticles = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { loggedUser } = req;

    const { author, tag, favorited } = req.query as any;
    const searchOptions = {
      include: [
        {
          model: Tag,
          as: "tagList",
          attributes: ["name"],
          ...(tag && { where: { name: tag } }),
        },
        {
          model: User,
          as: "author",
          attributes: PUBLIC_USER_ATTRIBUTES,
          ...(author && { where: { username: author } }),
        },
      ],
      ...parsePagination(req.query),
      order: [["createdAt", "DESC"]] as [string, string][],
    };

    let articles: { rows: any[]; count: number } = { rows: [], count: 0 };
    if (favorited) {
      const user = await User.findOne({ where: { username: favorited } });
      if (!user) throw new NotFoundError("User");

      articles.rows = await user.getFavorites(searchOptions);
      articles.count = await user.countFavorites();
    } else {
      articles = await Article.findAndCountAll(searchOptions);
    }

    await decorateArticles(loggedUser, articles.rows);

    res.json({ articles: articles.rows, articlesCount: articles.count });
  } catch (error) {
    next(error);
  }
};

//* Create Article
const createArticle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loggedUser } = req;

    if (
      !req.body ||
      typeof req.body.article !== "object" ||
      req.body.article === null ||
      Array.isArray(req.body.article)
    ) {
      throw new ValidationError("article payload is required");
    }

    const { title, description, body, tagList = [] } = req.body.article;
    if (typeof title !== "string" || !title.trim()) {
      throw new FieldRequiredError("A title");
    }
    if (typeof description !== "string" || !description.trim()) {
      throw new FieldRequiredError("A description");
    }
    if (typeof body !== "string" || !body.trim()) {
      throw new FieldRequiredError("An article body");
    }
    if (
      !Array.isArray(tagList) ||
      !tagList.every((tag) => typeof tag === "string")
    ) {
      throw new ValidationError("tagList must be an array of strings");
    }

    const slug = slugify(title);
    const slugInDB = await Article.findOne({ where: { slug: slug } });
    if (slugInDB) throw new AlreadyTakenError("Title");

    const article = await Article.create({
      slug: slug,
      title: title,
      description: description,
      body: body,
    });

    for (const tag of tagList) {
      const normalizedTag = (tag as string).trim();
      const tagInDB = await Tag.findByPk(normalizedTag);

      if (tagInDB) {
        await article.addTagList(tagInDB);
      } else if ((tag as string).length > 2) {
        const newTag = await Tag.create({ name: normalizedTag });

        await article.addTagList(newTag);
      }
    }

    article.dataValues.tagList = tagList;
    await article.setAuthor(loggedUser);
    await stampAuthor(loggedUser, article);
    await appendFavorites(loggedUser, article);

    res.status(201).json({ article });
  } catch (error) {
    next(error);
  }
};

//* Feed
const articlesFeed = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loggedUser } = req;

    const authors = await loggedUser.getFollowing();

    const articles = await Article.findAndCountAll({
      include: includeOptions,
      ...parsePagination(req.query),
      order: [["createdAt", "DESC"]],
      where: { userId: authors.map((author: any) => author.id) },
    });

    await decorateArticles(loggedUser, articles.rows);

    res.json({ articles: articles.rows, articlesCount: articles.count });
  } catch (error) {
    next(error);
  }
};

// Single Article by slug
const singleArticle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loggedUser } = req;

    const { slug } = req.params;
    const article = await findArticleBySlugOrFail(
      Article,
      slug as string,
      includeOptions,
    );

    await decorateArticle(loggedUser, article);

    res.json({ article });
  } catch (error) {
    next(error);
  }
};

//* Update Article
const updateArticle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loggedUser } = req;

    const { slug } = req.params;
    const article = await findArticleBySlugOrFail(
      Article,
      slug as string,
      includeOptions,
    );

    if (loggedUser.id !== article.author.id) {
      throw new ForbiddenError("article");
    }

    if (
      !req.body ||
      typeof req.body.article !== "object" ||
      req.body.article === null ||
      Array.isArray(req.body.article)
    ) {
      throw new ValidationError("article payload is required");
    }

    const { title, description, body } = req.body.article;
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        throw new ValidationError("title must be a non-empty string");
      }
      article.slug = slugify(title);
      article.title = title;
    }
    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        throw new ValidationError("description must be a non-empty string");
      }
      article.description = description;
    }
    if (body !== undefined) {
      if (typeof body !== "string" || !body.trim()) {
        throw new ValidationError("body must be a non-empty string");
      }
      article.body = body;
    }
    await article.save();

    await decorateArticle(loggedUser, article);

    res.json({ article });
  } catch (error) {
    next(error);
  }
};

//* Delete Article
const deleteArticle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { loggedUser } = req;

    const { slug } = req.params;
    const article = await findArticleBySlugOrFail(
      Article,
      slug as string,
      includeOptions,
    );

    if (loggedUser.id !== article.author.id) {
      throw new ForbiddenError("article");
    }

    await article.destroy();

    res.json({ message: { body: ["Article deleted successfully"] } });
  } catch (error) {
    next(error);
  }
};

export = {
  allArticles,
  createArticle,
  singleArticle,
  updateArticle,
  deleteArticle,
  articlesFeed,
};
