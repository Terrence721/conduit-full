import { useMemo, useState, type ReactNode } from "react";

type Article = {
  id: number;
  author: string;
  initials: string;
  role: string;
  date: string;
  title: string;
  description: string;
  readTime: string;
  tags: string[];
  likes: number;
  color: string;
  featured?: boolean;
};

const articles: Article[] = [
  {
    id: 1,
    author: "Maya Chen",
    initials: "MC",
    role: "Product designer",
    date: "May 24",
    title: "The quiet craft of designing for trust",
    description:
      "Trust is rarely built through a single grand gesture. It grows in the details: clear language, predictable patterns, and the confidence to leave space.",
    readTime: "6 min read",
    tags: ["Design", "Product"],
    likes: 428,
    color: "#d8f078",
    featured: true,
  },
  {
    id: 2,
    author: "Noah Williams",
    initials: "NW",
    role: "Software engineer",
    date: "May 23",
    title: "What I learned from deleting 10,000 lines of code",
    description:
      "A practical reflection on simplification, technical debt, and why the best code is often the code your team no longer needs.",
    readTime: "8 min read",
    tags: ["Engineering", "Career"],
    likes: 316,
    color: "#b9d9ff",
  },
  {
    id: 3,
    author: "Amara Okafor",
    initials: "AO",
    role: "Independent writer",
    date: "May 22",
    title: "Make room for the unfinished",
    description:
      "Our obsession with polished outcomes is costing us the playful, imperfect middle where original ideas actually take shape.",
    readTime: "4 min read",
    tags: ["Creativity", "Ideas"],
    likes: 274,
    color: "#ffc9b8",
  },
  {
    id: 4,
    author: "Leo Martinez",
    initials: "LM",
    role: "Founder at Common",
    date: "May 21",
    title: "A small team’s guide to meaningful momentum",
    description:
      "You do not need a bigger roadmap. You need a clearer reason to move, a shorter feedback loop, and fewer things competing for attention.",
    readTime: "5 min read",
    tags: ["Startups", "Leadership"],
    likes: 189,
    color: "#d8c7ff",
  },
];

const popularTags = [
  "Design",
  "Technology",
  "Culture",
  "Productivity",
  "Writing",
  "Career",
  "Ideas",
  "Startups",
];

function Icon({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {children}
    </svg>
  );
}

function SearchIcon() {
  return (
    <Icon size={18}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </Icon>
  );
}

function BookmarkIcon({ filled = false }: { filled?: boolean }) {
  return (
    <Icon size={19}>
      <path
        d="M6.5 4.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v17L12 18l-5.5 3.5z"
        fill={filled ? "currentColor" : "none"}
      />
    </Icon>
  );
}

function ArrowIcon() {
  return (
    <Icon size={18}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </Icon>
  );
}

function SparkIcon() {
  return (
    <Icon size={17}>
      <path d="M12 2.5c.6 5.3 3.2 8 8 8.5-4.8.6-7.4 3.3-8 8.5-.6-5.2-3.2-7.9-8-8.5 4.8-.5 7.4-3.2 8-8.5Z" />
    </Icon>
  );
}

function App() {
  const [feed, setFeed] = useState<"For you" | "Following">("For you");
  const [activeTag, setActiveTag] = useState("All topics");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const visibleArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let filtered =
      activeTag === "All topics"
        ? articles
        : articles.filter((article) => article.tags.includes(activeTag));

    if (normalizedQuery) {
      filtered = filtered.filter((article) =>
        [article.title, article.description, article.author, ...article.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      );
    }

    return feed === "Following" ? filtered.slice(1, 3) : filtered;
  }, [activeTag, feed, query]);

  const chooseTag = (tag: string) => {
    setActiveTag(tag);
    document
      .querySelector("#stories")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Conduit home">
          c<span aria-hidden="true">/</span>conduit
        </a>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#stories">Discover</a>
          <a href="#topics">Topics</a>
          <a href="#about">About</a>
        </nav>

        <div className="header-actions">
          <button className="search-trigger" type="button" aria-label="Search">
            <SearchIcon />
          </button>
          <a className="sign-in-link" href="#join">
            Sign in
          </a>
          <a className="join-button" href="#join">
            Join conduit
          </a>
          <button
            className="menu-button"
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            <span />
            <span />
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <a href="#stories" onClick={() => setMobileMenuOpen(false)}>
              Discover
            </a>
            <a href="#topics" onClick={() => setMobileMenuOpen(false)}>
              Topics
            </a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>
              About
            </a>
            <a href="#join" onClick={() => setMobileMenuOpen(false)}>
              Sign in
            </a>
          </nav>
        )}
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-orbit hero-orbit-two" aria-hidden="true" />
          <div className="hero-content">
            <div className="hero-kicker">
              <SparkIcon />A space for curious minds
            </div>
            <h1>
              Ideas worth
              <br />
              <em>sharing.</em>
            </h1>
            <p className="hero-copy">
              Read thoughtful stories, exchange perspectives, and learn
              something new from people who care about what they create.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href="#stories">
                Start reading <ArrowIcon />
              </a>
              <a className="secondary-button" href="#join">
                Share your story
              </a>
            </div>
            <div className="community-note">
              <div className="avatar-stack" aria-hidden="true">
                <span>MC</span>
                <span>NW</span>
                <span>AO</span>
              </div>
              <p>
                Join <strong>12,000+</strong> curious readers and writers
              </p>
            </div>
          </div>

          <aside className="featured-story" aria-label="Featured story">
            <div className="featured-label">
              <span>Editor’s pick</span>
              <span>01</span>
            </div>
            <div className="featured-art" aria-hidden="true">
              <span className="art-circle" />
              <span className="art-line art-line-one" />
              <span className="art-line art-line-two" />
              <span className="art-star">✦</span>
            </div>
            <div className="featured-copy">
              <div className="author-row">
                <span className="author-avatar">MC</span>
                <span>
                  <strong>Maya Chen</strong>
                  <small>6 min read</small>
                </span>
              </div>
              <h2>The quiet craft of designing for trust</h2>
              <a href="#article-1">
                Read featured story <ArrowIcon />
              </a>
            </div>
          </aside>
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
            View all <ArrowIcon />
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
                <SearchIcon />
                <span className="sr-only">Search stories</span>
                <input
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
              {visibleArticles.length ? (
                visibleArticles.map((article) => (
                  <article
                    className="article-card"
                    id={`article-${article.id}`}
                    key={article.id}
                  >
                    <div className="article-main">
                      <div className="article-author">
                        <span
                          className="author-avatar"
                          style={{ background: article.color }}
                        >
                          {article.initials}
                        </span>
                        <p>
                          <strong>{article.author}</strong>
                          <span>
                            {article.role} · {article.date}
                          </span>
                        </p>
                      </div>
                      <a
                        className="article-title-link"
                        href={`#article-${article.id}`}
                      >
                        <h3>{article.title}</h3>
                      </a>
                      <p className="article-description">
                        {article.description}
                      </p>
                      <div className="article-footer">
                        <div>
                          {article.tags.map((tag) => (
                            <button
                              type="button"
                              key={tag}
                              onClick={() => chooseTag(tag)}
                            >
                              {tag}
                            </button>
                          ))}
                          <span>{article.readTime}</span>
                        </div>
                        <div className="article-stats">
                          <span>{article.likes} appreciations</span>
                          <button
                            type="button"
                            className={
                              saved.includes(article.id) ? "saved" : ""
                            }
                            aria-label={
                              saved.includes(article.id)
                                ? `Remove ${article.title} from saved stories`
                                : `Save ${article.title}`
                            }
                            onClick={() =>
                              setSaved((current) =>
                                current.includes(article.id)
                                  ? current.filter((id) => id !== article.id)
                                  : [...current, article.id],
                              )
                            }
                          >
                            <BookmarkIcon filled={saved.includes(article.id)} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      className="article-art"
                      style={{ background: article.color }}
                      aria-hidden="true"
                    >
                      <span>{String(article.id).padStart(2, "0")}</span>
                      <i />
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-state">
                  <span>Nothing found</span>
                  <h3>Try another idea.</h3>
                  <p>
                    We couldn’t find a story matching your current search and
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
              <a href="#join">
                Start writing <ArrowIcon />
              </a>
            </div>

            <div className="sidebar-footer">
              <a href="#about">About</a>
              <a href="#top">Guidelines</a>
              <a href="#top">Privacy</a>
              <a href="#top">Help</a>
              <span>© 2026 Conduit</span>
            </div>
          </aside>
        </section>

        <section className="join-section" id="join">
          <div>
            <p className="section-eyebrow">One thoughtful email</p>
            <h2>Make space for better ideas.</h2>
            <p>
              Get our weekly edit of stories worth your time. No noise, no
              endless notifications.
            </p>
          </div>
          <form
            className="join-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <label>
              <span className="sr-only">Email address</span>
              <input
                required
                type="email"
                placeholder="Your email address"
                autoComplete="email"
              />
            </label>
            <button type="submit">
              Join the community <ArrowIcon />
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default App;
