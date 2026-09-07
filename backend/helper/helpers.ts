import customErrors from "./customErrors";

const { NotFoundError } = customErrors;

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

const appendFollowers = async (loggedUser: any, toAppend: any) => {
  //
  if (toAppend?.author) {
    const author = await toAppend.getAuthor();

    const following = await author.hasFollower(loggedUser ? loggedUser : null);
    toAppend.author.dataValues.following = loggedUser ? following : false;

    const followersCount = await author.countFollowers();
    toAppend.author.dataValues.followersCount = followersCount;
    //
  } else {
    const following = await toAppend.hasFollower(
      loggedUser ? loggedUser : null,
    );
    toAppend.dataValues.following = loggedUser ? following : false;

    const followersCount = await toAppend.countFollowers();
    toAppend.dataValues.followersCount = followersCount;
  }
};

export = {
  slugify,
  findArticleBySlugOrFail,
  appendTagList,
  appendFavorites,
  appendFollowers,
};
