import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useArticles from "../hooks/useArticles";
import dateFormatter from "../helpers/dateFormatter";
import type { ArticleLocation } from "../types";

const popularTags = [
  "Design",
  "Technology",
  "Culture",
  "Productivity",
  "Writing",
  "Career",
  "Ideas",
  "Startups",
  "Engineering",
  "Leadership",
];

const colors = [
  "#d8f078",
  "#b9d9ff",
  "#ffc9b8",
  "#d8c7ff",
  "#f6d58d",
  "#a9e2cf",
];

function initials(username: string): string {
  return (
    username
      .split(/[\s_-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || username.slice(0, 2).toUpperCase()
  );
}

function authorRole(bio: string | null): string {
  return bio?.trim() ? bio.trim() : "Contributor";
}

function readTime(body: string | undefined): string {
  const words = body?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return `${Math.max(3, Math.ceil(words / 220))} min read`;
}

export default function Home() {
  const { isAuth } = useAuth();
  const [feed, setFeed] = useState<"For you" | "Following">("For you");
  const [activeTag, setActiveTag] = useState("All topics");
  const [query, setQuery] = useState("");

  const location: ArticleLocation =
    activeTag !== "All topics"
      ? "tag"
      : feed === "Following" && isAuth
        ? "feed"
        : "global";

  const { articles, loading } = useArticles({
    location,
    tagName: activeTag !== "All topics" ? activeTag : undefined,
  });

  const visibleArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let filtered = articles ?? [];

    if (normalizedQuery) {
      filtered = filtered.filter((article) =>
        [
          article.title,
          article.description,
          article.author.username,
          ...article.tagList,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    }

    return filtered;
  }, [articles, query]);

  const chooseTag = (tag: string) => {
    setActiveTag(tag);
    document
      .querySelector("#stories")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-kicker">
            <span>A space for curious minds</span>
          </div>
          <h1>
            Ideas worth
            <br />
            <em>sharing.</em>
          </h1>
          <p className="hero-copy">
            Read thoughtful stories, exchange perspectives, and learn something
            new from people who care about what they create.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#stories">
              Start reading
            </a>
            {isAuth ? null : (
              <a className="secondary-button" href="/register">
                Share your story
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="topic-strip" id="topics" aria-label="Browse topics">
        <span className="topic-label">Explore topics</span>
        {popularTags.slice(0, 6).map((tag) => (
          <button type="button" key={tag} onClick={() => chooseTag(tag)}>
            {tag}
          </button>
        ))}
        <button
          className="all-topics"
          type="button"
          onClick={() => chooseTag("All topics")}
        >
          View all
        </button>
      </section>

      <section className="content-section" id="stories">
        <div className="feed-column">
          <div className="feed-heading">
            <div>
              <p className="section-eyebrow">Your daily read</p>
              <h2>Stories for curious people</h2>
            </div>
            <label className="feed-search">
              <span className="sr-only">Search stories</span>
              <input
                id="story-search"
                name="story-search"
                type="search"
                placeholder="Search stories"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          <div className="feed-controls">
            <div className="feed-tabs" role="tablist" aria-label="Feed view">
              {(["For you", "Following"] as const).map((tab) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={feed === tab}
                  className={feed === tab ? "active" : ""}
                  key={tab}
                  onClick={() => setFeed(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeTag !== "All topics" && (
              <button
                className="active-filter"
                type="button"
                onClick={() => setActiveTag("All topics")}
              >
                {activeTag} <span aria-hidden="true">×</span>
              </button>
            )}
          </div>

          <div className="article-list">
            {loading ? (
              <div className="article-preview">
                <em>Loading articles list...</em>
              </div>
            ) : visibleArticles.length ? (
              visibleArticles.map((article, index) => (
                <article className="article-card" key={article.slug}>
                  <div className="article-main">
                    <div className="article-author">
                      <span
                        className="author-avatar"
                        style={{ background: colors[index % colors.length] }}
                      >
                        {initials(article.author.username)}
                      </span>
                      <p>
                        <strong>{article.author.username}</strong>
                        <span>
                          {authorRole(article.author.bio)} ·{" "}
                          {dateFormatter(article.createdAt)}
                        </span>
                      </p>
                    </div>
                    <Link
                      className="article-title-link"
                      to={`/article/${article.slug}`}
                    >
                      <h3>{article.title}</h3>
                    </Link>
                    <p className="article-description">{article.description}</p>
                    <div className="article-footer">
                      <div>
                        {article.tagList.map((tag) => (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => chooseTag(tag)}
                          >
                            {tag}
                          </button>
                        ))}
                        <span>{readTime(article.body)} min read</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="article-art"
                    style={{ background: colors[index % colors.length] }}
                    aria-hidden="true"
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <i />
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <span>Nothing found</span>
                <h3>Try another idea.</h3>
                <p>
                  We couldn’t find articles matching your current search and
                  filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setActiveTag("All topics");
                    setFeed("For you");
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="sidebar">
          <div className="sidebar-block">
            <div className="sidebar-title">
              <h3>Popular topics</h3>
              <span>Right now</span>
            </div>
            <div className="tag-cloud">
              {popularTags.map((tag) => (
                <button
                  type="button"
                  className={activeTag === tag ? "active" : ""}
                  key={tag}
                  onClick={() => chooseTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="writer-card" id="about">
            <span className="writer-card-mark" aria-hidden="true">
              ✦
            </span>
            <p className="section-eyebrow">Write on conduit</p>
            <h3>Your perspective belongs here.</h3>
            <p>
              Publish your ideas, find your readers, and join a thoughtful
              community.
            </p>
            <Link to={isAuth ? "/editor" : "/login"}>Start writing</Link>
          </div>
        </aside>
      </section>
    </div>
  );
}
