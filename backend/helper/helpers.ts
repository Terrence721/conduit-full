import customErrors from "./customErrors";

const { NotFoundError } = customErrors;

// The public-safe projection of a User shown as someone else's profile or
// article/comment author -- an allowlist rather than an `exclude: ["email"]`
// list, so a sensitive column never gets fetched into memory in the first
// place instead of relying on it being stripped later. "id" has to stay
// listed even though it's not shown on the wire (User.toJSON strips it):
// Sequelize does NOT implicitly include the primary key when an explicit
// attributes array is given, and both ownership checks (article.author.id)
// and association instance methods (hasFollower/addFollower/getFollowing,
// etc.) need it internally -- confirmed the hard way, by a real test
// failure, not assumed. "following"/"followersCount" are computed
// separately by appendFollowers, not real columns. Not used for
// `req.loggedUser` itself, which legitimately needs to remain settable
// across every field for profile updates.
const PUBLIC_USER_ATTRIBUTES = ["id", "username", "bio", "image"];

const slugify = (string: string): string => {
  return string.trim().toLowerCase().replace(/\W|_/g, "-");
};

const findArticleBySlugOrFail = async (
  Article: {
    findOne: (options: unknown) => Promise<Record<string, unknown> | null>;
  },
  slug: string,
  include?: unknown[],
) => {
  const article = await Article.findOne({
    where: { slug },
    ...(include && { include }),
  });
  if (!article) throw new NotFoundError("Article");
  return article;
};

const findProfileByUsernameOrFail = async (
  User: {
    findOne: (options: unknown) => Promise<Record<string, unknown> | null>;
  },
  username: string,
) => {
  const profile = await User.findOne({
    where: { username },
    attributes: PUBLIC_USER_ATTRIBUTES,
  });
  if (!profile) throw new NotFoundError("User profile");
  return profile;
};

// `offset` in the query string is a page INDEX (0-based), not a raw row
// offset -- the frontend sends `offset=<page>` (see ArticlesPagination.tsx /
// getArticles.ts) and Sequelize needs the actual row offset, page * limit.
// Falls back to sane defaults instead of letting an unparseable value (e.g.
// ?limit=abc) become NaN and silently propagate into the Sequelize query.
const parsePagination = (query: Record<string, unknown>) => {
  const parsedLimit = parseInt(String(query.limit ?? "3"), 10);
  const parsedPage = parseInt(String(query.offset ?? "0"), 10);
  const limit = Number.isNaN(parsedLimit) ? 3 : parsedLimit;
  const page = Number.isNaN(parsedPage) ? 0 : parsedPage;
  return { limit, offset: page * limit };
};

const appendTagList = (
  articleTags: { name: string }[],
  article?: { dataValues: Record<string, unknown> },
) => {
  const tagList = articleTags.map((tag) => tag.name);

  if (!article || !article.dataValues) return tagList;
  article.dataValues.tagList = tagList;
};

const appendFavorites = async (loggedUser: unknown, article: unknown) => {
  const articleInstance = article as {
    countFavoritingUsers: () => Promise<number>;
    dataValues: Record<string, unknown>;
    hasFavoritingUser: (user: unknown) => Promise<boolean>;
  };

  const favorited = await articleInstance.hasFavoritingUser(loggedUser ?? null);
  articleInstance.dataValues.favorited = loggedUser ? favorited : false;

  const favoritesCount = await articleInstance.countFavoritingUsers();
  articleInstance.dataValues.favoritesCount = favoritesCount;
};

const appendFollowers = async (loggedUser: unknown, user: unknown) => {
  const userInstance = user as {
    countFollowers: () => Promise<number>;
    dataValues: Record<string, unknown>;
    hasFollower: (value: unknown) => Promise<boolean>;
  };

  const following = await userInstance.hasFollower(loggedUser ?? null);
  userInstance.dataValues.following = loggedUser ? following : false;

  const followersCount = await userInstance.countFollowers();
  userInstance.dataValues.followersCount = followersCount;
};

// For an Article/Comment whose `.author` was already eagerly included in the
// original query -- fetches a fresh author instance to compute follow
// status (association instance methods need their own live row), then
// copies the result onto the eagerly-included sub-object, since that's the
// one actually serialized in the response.
const appendAuthorFollowers = async (loggedUser: unknown, entity: unknown) => {
  const entityInstance = entity as {
    author: { dataValues: Record<string, unknown> };
    getAuthor: () => Promise<unknown>;
  };
  const author = await entityInstance.getAuthor();
  await appendFollowers(loggedUser, author);
  entityInstance.author.dataValues.following = (
    author as { dataValues: Record<string, unknown> }
  ).dataValues.following;
  entityInstance.author.dataValues.followersCount = (
    author as { dataValues: Record<string, unknown> }
  ).dataValues.followersCount;
};

// Stamps the just-created loggedUser as a newly created Article/Comment's
// author, for the immediate response to the person who created it (nobody
// else ever sees this -- other viewers re-fetch through
// PUBLIC_USER_ATTRIBUTES). Strips the token verifyToken stamped onto
// loggedUser first, since that's a request-scoped implementation detail with
// no business being in a response body, then decorates loggedUser's own
// follow status since it's about to be serialized as `entity.author`.
const stampAuthor = async (loggedUser: unknown, entity: unknown) => {
  const userInstance = loggedUser as { dataValues: Record<string, unknown> };
  const entityInstance = entity as { dataValues: Record<string, unknown> };

  delete userInstance.dataValues.token;
  entityInstance.dataValues.author = loggedUser;
  await appendFollowers(loggedUser, loggedUser);
};

const decorateArticle = async (loggedUser: unknown, article: unknown) => {
  const articleInstance = article as {
    dataValues: Record<string, unknown>;
    tagList?: { name: string }[];
  };

  appendTagList(articleInstance.tagList ?? [], articleInstance);
  await appendAuthorFollowers(loggedUser, articleInstance);
  await appendFavorites(loggedUser, articleInstance);

  // Only set when the article came from a User's `getFavorites()` association
  // fetcher (the through-model's data rides along on the instance under the
  // through model's own name); harmless no-op otherwise.
  delete articleInstance.dataValues.Favorites;
};

const decorateArticles = async (loggedUser: unknown, articles: unknown[]) => {
  for (const article of articles) {
    await decorateArticle(loggedUser, article);
  }
};

export = {
  PUBLIC_USER_ATTRIBUTES,
  slugify,
  findArticleBySlugOrFail,
  findProfileByUsernameOrFail,
  parsePagination,
  appendTagList,
  appendFavorites,
  appendFollowers,
  appendAuthorFollowers,
  stampAuthor,
  decorateArticle,
  decorateArticles,
};
