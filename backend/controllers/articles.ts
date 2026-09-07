import type { Request, Response, NextFunction } from "express";
import models from "../models";
import helpers from "../helper/helpers";
import customErrors from "../helper/customErrors";

const { AlreadyTakenError, FieldRequiredError, ForbiddenError, NotFoundError } =
  customErrors;
const {
  appendFollowers,
  appendFavorites,
  findArticleBySlugOrFail,
  decorateArticle,
  decorateArticles,
  slugify,
  PUBLIC_USER_ATTRIBUTES,
} = helpers;
const { Article, Tag, User } = models;

const includeOptions = [
  { model: Tag, as: "tagList", attributes: ["name"] },
  { model: User, as: "author", attributes: PUBLIC_USER_ATTRIBUTES },
];

//? All Articles - by Author/by Tag/Favorited by user
const allArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { loggedUser } = req;

    const { author, tag, favorited, limit = 3, offset = 0 } = req.query as any;
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
      limit: parseInt(limit),
      offset: offset * limit,
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

    const { title, description, body, tagList = [] } = req.body.article;
    if (!title) throw new FieldRequiredError("A title");
    if (!description) throw new FieldRequiredError("A description");
    if (!body) throw new FieldRequiredError("An article body");

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
      const tagInDB = await Tag.findByPk(tag.trim());

      if (tagInDB) {
        await article.addTagList(tagInDB);
      } else if (tag.length > 2) {
        const newTag = await Tag.create({ name: tag.trim() });

        await article.addTagList(newTag);
      }
    }

    delete loggedUser.dataValues.token;

    article.dataValues.tagList = tagList;
    await article.setAuthor(loggedUser);
    article.dataValues.author = loggedUser;
    await appendFollowers(loggedUser, loggedUser);
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

    const { limit = 3, offset = 0 } = req.query as any;
    const authors = await loggedUser.getFollowing();

    const articles = await Article.findAndCountAll({
      include: includeOptions,
      limit: parseInt(limit),
      offset: offset * limit,
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

    const { title, description, body } = req.body.article;
    if (title) {
      article.slug = slugify(title);
      article.title = title;
    }
    if (description) article.description = description;
    if (body) article.body = body;
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
