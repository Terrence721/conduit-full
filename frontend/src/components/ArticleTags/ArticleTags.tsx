interface ArticleTagsProps {
  tagList: string[];
}

function ArticleTags({ tagList }: ArticleTagsProps) {
  return (
    tagList.length > 0 && (
      <ul className="tag-list">
        {tagList.map((tag) => (
          <li key={tag} className="tag-default tag-pill tag-outline">
            {tag}
          </li>
        ))}
      </ul>
    )
  );
}

export default ArticleTags;
