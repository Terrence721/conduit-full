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
  Article: any,
  slug: string,
  include?: any[],
) => {
  const article = await Article.findOne({
    where: { slug },
    ...(include && { include }),
  });
  if (!article) throw new NotFoundError("Article");
  return article;
};

const findProfileByUsernameOrFail = async (User: any, username: string) => {
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
const parsePagination = (query: any) => {
  const parsedLimit = parseInt(query.limit ?? "3", 10);
  const parsedPage = parseInt(query.offset ?? "0", 10);
  const limit = Number.isNaN(parsedLimit) ? 3 : parsedLimit;
  const page = Number.isNaN(parsedPage) ? 0 : parsedPage;
  return { limit, offset: page * limit };
};

const appendTagList = (articleTags: any[], article?: any) => {
  const tagList = articleTags.map((tag) => tag.name);

  if (!article) return tagList;
  article.dataValues.tagList = tagList;
};

const appendFavorites = async (loggedUser: any, article: any) => {
  const favorited = await article.hasUser(loggedUser ? loggedUser : null);
  article.dataValues.favorited = loggedUser ? favorited : false;

  const favoritesCount = await article.countUsers();
  article.dataValues.favoritesCount = favoritesCount;
};

const appendFollowers = async (loggedUser: any, user: any) => {
  const following = await user.hasFollower(loggedUser ? loggedUser : null);
  user.dataValues.following = loggedUser ? following : false;

  const followersCount = await user.countFollowers();
  user.dataValues.followersCount = followersCount;
};

// For an Article/Comment whose `.author` was already eagerly included in the
// original query -- fetches a fresh author instance to compute follow
// status (association instance methods need their own live row), then
// copies the result onto the eagerly-included sub-object, since that's the
// one actually serialized in the response.
const appendAuthorFollowers = async (loggedUser: any, entity: any) => {
  const author = await entity.getAuthor();
  await appendFollowers(loggedUser, author);
  entity.author.dataValues.following = author.dataValues.following;
  entity.author.dataValues.followersCount = author.dataValues.followersCount;
};

const decorateArticle = async (loggedUser: any, article: any) => {
  appendTagList(article.tagList, article);
  await appendAuthorFollowers(loggedUser, article);
  await appendFavorites(loggedUser, article);

  // Only set when the article came from a User's `getFavorites()` association
  // fetcher (the through-model's data rides along on the instance under the
  // through model's own name); harmless no-op otherwise.
  delete article.dataValues.Favorites;
};

const decorateArticles = async (loggedUser: any, articles: any[]) => {
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
  decorateArticle,
  decorateArticles,
};
