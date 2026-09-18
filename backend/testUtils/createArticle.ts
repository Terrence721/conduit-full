const createArticle = async (db: any, author: any, overrides = {}) => {
  const article = await db.Article.create({
    slug: "how-to-train-your-dragon",
    title: "How to train your dragon",
    description: "d",
    body: "b",
    ...overrides,
  });
  await article.setAuthor(author);
  return article;
};

export = createArticle;
