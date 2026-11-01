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
  body: {
    heading: string;
    paragraphs: string[];
  }[];
};

const articles: Article[] = [
  {
    id: 1,
    author: "Elena Park",
    initials: "EP",
    role: "Product designer",
    date: "May 24",
    title: "The case for designing slower",
    description:
      "Speed can help teams ship, but it can also hide uncertainty. A slower approach at the right moments creates space for better questions, clearer decisions, and products people can trust.",
    readTime: "7 min read",
    tags: ["Design", "Product"],
    likes: 428,
    color: "#d8f078",
    featured: true,
    body: [
      {
        heading: "Speed is not the same as progress",
        paragraphs: [
          "Modern product teams are taught to value momentum. We celebrate short cycles, rapid experiments, and the ability to ship before certainty arrives. That instinct is useful. It keeps ideas from becoming precious and brings real people into the process. But speed becomes dangerous when it stops being a tool and becomes the goal. A team can move quickly for months while avoiding the one difficult question that would change everything.",
          "The cost usually appears later: in an interface that needs constant explanation, in support tickets that repeat the same confusion, or in a roadmap crowded with fixes for decisions nobody had time to examine. Designing slowly does not mean extending every deadline. It means recognizing the moments when thought is cheaper than rework.",
        ],
      },
      {
        heading: "Create deliberate pauses",
        paragraphs: [
          "A useful pause can be remarkably small. Before drawing a screen, write down what the person using it should understand. Before adding a setting, ask whether the system could make a better default choice. Before approving a polished flow, invite someone unfamiliar with the project to describe what they think is happening. These pauses interrupt momentum just long enough to expose assumptions.",
        ],
      },
      {
        heading: "Let the problem become clear",
        paragraphs: [
          "Uncertainty often feels like inefficiency, so teams rush to cover it with artifacts. Yet a beautiful prototype cannot rescue a vague problem. The strongest designers I know are comfortable staying in the uncomfortable middle. They listen for contradictions, revisit the brief, and separate what customers say from what their behavior reveals. Their work may look slower at first, but it becomes faster because fewer decisions need to be undone.",
        ],
      },
      {
        heading: "Choose the right pace",
        paragraphs: [
          "Not every decision deserves deep reflection. Reversible choices should remain quick. The important skill is identifying the decisions that shape trust, access, and the product’s underlying direction. Slow down there. Make the tradeoffs visible. Give language and structure the same attention as color and motion. Good design is not defined by how long it takes, but by whether the team gave the consequential parts enough time to become honest.",
        ],
      },
    ],
  },
  {
    id: 2,
    author: "Marcus Reed",
    initials: "MR",
    role: "Learning researcher",
    date: "May 23",
    title: "What beginners notice that experts overlook",
    description:
      "Expertise helps us recognize patterns quickly, but it can also make familiar problems invisible. Beginners often see awkward assumptions and unexplored possibilities more clearly.",
    readTime: "5 min read",
    tags: ["Ideas", "Creativity"],
    likes: 316,
    color: "#b9d9ff",
    body: [
      {
        heading: "The advantage of not knowing",
        paragraphs: [
          "On their first day, a new colleague asked why our weekly meeting lasted an hour. The room went quiet. Nobody remembered choosing an hour; it was simply the shape the meeting had acquired. Her question was basic, almost naive, and that was precisely why it was useful. Experts learn which questions have accepted answers. Beginners have not yet learned to stop asking them.",
          "Experience helps us compress complexity. A doctor recognizes a familiar cluster of symptoms, a designer sees a known interaction pattern, and a mechanic hears the likely source of a rattle. This pattern recognition is powerful, but every shortcut hides detail. The more fluent we become, the less likely we are to notice the instructions, rituals, and workarounds that confuse someone arriving for the first time.",
        ],
      },
      {
        heading: "Friction is information",
        paragraphs: [
          "Beginners pause where experts move automatically. They reread the label, search for the missing tool, or ask why step four must happen before step three. Instead of treating these moments as evidence that someone needs more training, we can treat them as observations about the system. Confusion often reveals knowledge that was never made visible.",
        ],
      },
      {
        heading: "Invite the obvious question",
        paragraphs: [
          "Teams can protect beginner vision by making room for it. Ask new members to keep a friction log during their first month. In reviews, let the least familiar person respond before the experts explain. When teaching a process, notice which steps require the phrase ‘you just know.’ These practices are not a replacement for expertise; they keep expertise from becoming sealed off from reality.",
        ],
      },
      {
        heading: "Stay new a little longer",
        paragraphs: [
          "The goal is not to remain inexperienced. It is to preserve some of the attention that inexperience demands. Experts who continue to notice are willing to name what has become normal, test the rules they inherited, and listen without rushing to translate every new problem into an old one. Sometimes progress begins with the person in the room who does not yet know what cannot be changed.",
        ],
      },
    ],
  },
  {
    id: 3,
    author: "Priya Shah",
    initials: "PS",
    role: "Independent writer",
    date: "May 22",
    title: "A practical guide to protecting your attention",
    description:
      "Focus is not a personality trait. It is the result of boundaries, environments, and small choices that make distraction less convenient and meaningful work easier to begin.",
    readTime: "6 min read",
    tags: ["Productivity", "Career"],
    likes: 274,
    color: "#ffc9b8",
    body: [
      {
        heading: "Attention has an environment",
        paragraphs: [
          "For years I treated focus as a test of character. On productive days I felt disciplined; on distracted days I assumed I lacked willpower. But attention is less like a moral virtue and more like water: it follows the channels around it. A phone within reach, an inbox left open, and a calendar split into fragments create channels toward interruption.",
          "Protecting attention starts with changing those channels. The aim is not to become unreachable or to construct a perfect morning routine. It is to make the work you value slightly easier to enter and the distractions you regret slightly harder to reach.",
        ],
      },
      {
        heading: "Reduce the number of doors",
        paragraphs: [
          "Before beginning, close everything unrelated to the task and write the next visible action in plain language. ‘Work on proposal’ is vague; ‘draft the opening argument’ gives your mind a door. Put your phone in another room when possible. Sign out of services that pull you in automatically. A few seconds of added friction can be enough to turn an impulse back toward your work.",
        ],
      },
      {
        heading: "Use boundaries others can understand",
        paragraphs: [
          "Focus becomes fragile when people do not know when you are available. Create predictable response windows instead of trying to answer continuously. Tell collaborators when you will check messages and what qualifies as urgent. Clear boundaries are generous: they replace uncertainty with an agreement and let everyone plan around the same expectations.",
        ],
      },
      {
        heading: "Return without punishment",
        paragraphs: [
          "You will still get distracted. The most useful response is not frustration but a practiced return. Keep a scrap of paper nearby, note the thought that pulled you away, and resume the smallest next step. Attention is not protected once; it is renewed repeatedly. The measure of a focused life is not never wandering. It is learning how to come back to what matters without wasting more attention on blame.",
        ],
      },
    ],
  },
  {
    id: 4,
    author: "Daniel Kim",
    initials: "DK",
    role: "Software engineer",
    date: "May 21",
    title: "Why healthy engineering teams write things down",
    description:
      "Good documentation is more than an archive. It gives decisions a history, helps new teammates contribute sooner, and reduces the number of meetings needed to move forward.",
    readTime: "8 min read",
    tags: ["Engineering", "Technology"],
    likes: 189,
    color: "#d8c7ff",
    body: [
      {
        heading: "Memory is not infrastructure",
        paragraphs: [
          "Every engineering team has invisible knowledge. It lives in the person who remembers why a service was separated, the message thread where a risky tradeoff was approved, and the unwritten sequence required to make a release. This arrangement can feel efficient while the team is small. Ask the person who knows, get the answer, and keep moving. Then that person takes a vacation.",
          "Writing things down is not bureaucracy for its own sake. It converts private memory into shared infrastructure. A useful document lets someone make a safe decision without locating the right colleague, reconstructing a conversation, or repeating an old mistake.",
        ],
      },
      {
        heading: "Document decisions, not just systems",
        paragraphs: [
          "Technical references explain what exists, but teams also need to know why it exists. A short decision record should name the context, the options considered, the choice made, and the consequences accepted. This history prevents future engineers from assuming an odd-looking constraint is accidental. It also makes it easier to revisit the decision when its original conditions change.",
        ],
      },
      {
        heading: "Keep writing close to the work",
        paragraphs: [
          "Documentation decays when updating it requires a separate ceremony. Store operational notes beside the code they describe. Add a checklist to the pull request that changes the process. Give every important document an owner and a visible review date. Prefer a short, current explanation over an impressive handbook nobody trusts.",
        ],
      },
      {
        heading: "Writing improves the decision",
        paragraphs: [
          "The act of explaining a plan often reveals what conversation hides. Ambiguous terms become obvious. Missing evidence creates an uncomfortable blank. Disagreement becomes specific enough to resolve. Healthy teams write not because they distrust conversation, but because writing slows reasoning just enough to make it inspectable. The document is useful later; the clarity it creates is useful now.",
        ],
      },
    ],
  },
  {
    id: 5,
    author: "Sofia Alvarez",
    initials: "SA",
    role: "Career coach",
    date: "May 20",
    title: "Your career does not need a perfect five-year plan",
    description:
      "Careers rarely develop in straight lines. Instead of predicting every step, build useful skills, follow genuine curiosity, and choose opportunities that leave more doors open.",
    readTime: "5 min read",
    tags: ["Career", "Ideas"],
    likes: 241,
    color: "#f6d58d",
    body: [
      {
        heading: "The comfort of a straight line",
        paragraphs: [
          "A five-year plan promises relief from uncertainty. If you can name the role, company, and milestones ahead, today’s choices appear easier. But most careers are shaped by conditions no plan can anticipate: a new technology, a surprising collaborator, a family need, an industry contraction, or a skill you discover only by trying it.",
          "Planning is not useless. The problem is confusing a plan with a prediction. When people become loyal to an old map, they can miss evidence that their interests, strengths, or circumstances have changed.",
        ],
      },
      {
        heading: "Choose a direction, not a destination",
        paragraphs: [
          "Replace the perfect title with a direction of growth. You might want to work closer to customers, become excellent at explaining complex ideas, or take responsibility for larger systems. A direction can guide immediate choices without pretending you know the exact shape of the future.",
        ],
      },
      {
        heading: "Build career options",
        paragraphs: [
          "The most resilient choices create options. Develop skills that travel across organizations. Maintain relationships before you need them. Keep examples of your work and record what each project taught you. Financial breathing room, when available, is also a career tool: it gives you more freedom to decline work that moves you away from your values.",
        ],
      },
      {
        heading: "Review the evidence",
        paragraphs: [
          "Every six months, ask what has been giving you energy, what you are becoming known for, and which problems you want to understand more deeply. Then make one choice that reflects those answers. A meaningful career is not built by correctly guessing who you will be in five years. It is built by paying close attention to who you are becoming now.",
        ],
      },
    ],
  },
  {
    id: 6,
    author: "Jamal Brooks",
    initials: "JB",
    role: "Community strategist",
    date: "May 19",
    title: "The underrated value of small communities",
    description:
      "The internet rewards scale, but belonging often happens in smaller spaces. Thoughtful communities grow through shared rituals, mutual responsibility, and the feeling of being recognized.",
    readTime: "6 min read",
    tags: ["Culture", "Ideas"],
    likes: 352,
    color: "#a9e2cf",
    body: [
      {
        heading: "Big audiences, small belonging",
        paragraphs: [
          "The platforms that connect us tend to measure success in totals: followers, members, views, and reach. Those numbers can represent real opportunity, but they tell us little about whether anyone feels known. A room can contain thousands of people and still leave each person speaking into the distance.",
          "Small communities work differently. Repetition creates recognition. People remember what you were wrestling with last week. Your absence can be noticed, and your contribution changes what the group is able to do.",
        ],
      },
      {
        heading: "Ritual creates a shared rhythm",
        paragraphs: [
          "The healthiest small groups often have modest rituals: a weekly question, a monthly dinner, a regular critique, or a moment when newcomers introduce what they hope to learn. Ritual reduces the social cost of participation. People do not have to invent a reason to appear; the invitation is already waiting.",
        ],
      },
      {
        heading: "Contribution matters more than access",
        paragraphs: [
          "A community weakens when most members are treated as an audience for a few central voices. Give people meaningful ways to help: welcome someone new, document what the group learned, host a conversation, or offer a skill. Responsibility turns attendance into ownership, provided it is shared rather than concentrated in the most enthusiastic volunteers.",
        ],
      },
      {
        heading: "Grow at the speed of trust",
        paragraphs: [
          "Not every community should become a network of millions. Sometimes the value is precisely that the circle remains small enough for memory and accountability. Growth can still happen through many connected groups, each with its own context and care. The important question is not how many people can enter. It is whether the relationships that made the space valuable can survive the way it grows.",
        ],
      },
    ],
  },
  {
    id: 7,
    author: "Hannah Lee",
    initials: "HL",
    role: "Startup advisor",
    date: "May 18",
    title: "Build a product people can explain in one sentence",
    description:
      "If customers cannot clearly describe what a product does, its value may still be too complicated. Simplicity begins with choosing the one problem that matters most.",
    readTime: "7 min read",
    tags: ["Startups", "Product"],
    likes: 297,
    color: "#c8d7ff",
    body: [
      {
        heading: "The explanation test",
        paragraphs: [
          "Ask five customers what your product does. If their answers sound like five different companies, you may have a clarity problem. This is not merely a marketing issue. People struggle to describe products when the experience asks them to hold too many promises at once.",
          "Founders often respond by polishing the sentence. They search for a cleverer category or add words that cover every use case. The sentence grows more accurate and less understandable. Clarity rarely comes from better compression; it comes from making a sharper choice.",
        ],
      },
      {
        heading: "Choose the central job",
        paragraphs: [
          "Your product may help customers do many things, but one of those outcomes probably creates the initial pull. Name the person, the frustrating moment, and the change they want. Features should strengthen that path before they expand the perimeter. When the central job is obvious, customers know when to reach for the product and whom to recommend it to.",
        ],
      },
      {
        heading: "Remove competing promises",
        paragraphs: [
          "Review your homepage, onboarding, and navigation for equal emphasis. When everything appears important, customers have to construct the hierarchy themselves. Lead with the value they can experience soonest. Move advanced capabilities out of the first encounter. Simplicity is not the absence of power; it is power revealed in a useful order.",
        ],
      },
      {
        heading: "Listen to borrowed language",
        paragraphs: [
          "The best sentence often comes from customers rather than a brainstorm. Notice how successful users describe the product to a colleague. Their language contains context, urgency, and a result. Use it as evidence. A product people can explain is easier to remember, easier to trust, and easier to improve because the team knows which promise every new decision must support.",
        ],
      },
    ],
  },
  {
    id: 8,
    author: "Theo Bennett",
    initials: "TB",
    role: "Editor",
    date: "May 17",
    title: "Good writing begins before the first sentence",
    description:
      "Strong writing is rarely the result of finding perfect words immediately. It begins with observation, note-taking, and developing a clear idea of what the reader should carry away.",
    readTime: "4 min read",
    tags: ["Writing", "Creativity"],
    likes: 388,
    color: "#f4bfc9",
    body: [
      {
        heading: "Collect before you compose",
        paragraphs: [
          "The blank page feels empty only when we arrive empty-handed. Most strong pieces begin days or years before the drafting session: with a sentence copied into a notebook, a contradiction noticed during a meeting, or a question that refuses to disappear. Writing starts when attention gives an idea somewhere to land.",
          "Keep a simple collection practice. Record exact phrases, concrete details, questions, and moments that surprise you. Do not demand that every note justify itself. The purpose is to preserve raw material before memory smooths away what made it interesting.",
        ],
      },
      {
        heading: "Find the change",
        paragraphs: [
          "Before drafting, complete this sentence: ‘By the end, I want the reader to see…’ A piece needs movement, even when it is short. Perhaps the familiar becomes strange, the complicated becomes usable, or an opinion becomes harder to hold carelessly. This intended change helps you choose which notes belong and which are merely adjacent.",
        ],
      },
      {
        heading: "Draft toward meaning",
        paragraphs: [
          "An outline should not become a cage, but it can give the first draft a direction. Arrange your evidence in the order a reader needs it, not the order you discovered it. Start with the tension. Earn the abstraction through examples. When you get stuck, write the plain version of what you mean; elegance can arrive during revision.",
        ],
      },
      {
        heading: "Revision is a form of listening",
        paragraphs: [
          "Read the draft for the question a curious reader would ask next. Remove the paragraph that demonstrates research but delays the idea. Replace summary with a detail someone can see. Good revision is not decoration. It is the process of noticing where your thought has become difficult to follow and making a clearer path through it.",
        ],
      },
    ],
  },
  {
    id: 9,
    author: "Aisha Rahman",
    initials: "AR",
    role: "Technology researcher",
    date: "May 16",
    title: "The technology we choose shapes the work we do",
    description:
      "Tools are not neutral containers for our ideas. Their defaults influence how teams communicate, what they measure, and which kinds of work receive the most attention.",
    readTime: "8 min read",
    tags: ["Technology", "Culture"],
    likes: 263,
    color: "#d2e998",
    body: [
      {
        heading: "Memory is not infrastructure",
        paragraphs: [
          "Every engineering team has invisible knowledge. It lives in the person who remembers why a service was separated, the message thread where a risky tradeoff was approved, and the unwritten sequence required to make a release. This arrangement can feel efficient while the team is small. Ask the person who knows, get the answer, and keep moving. Then that person takes a vacation.",
          "Writing things down is not bureaucracy for its own sake. It converts private memory into shared infrastructure. A useful document lets someone make a safe decision without locating the right colleague, reconstructing a conversation, or repeating an old mistake.",
        ],
      },
      {
        heading: "Document decisions, not just systems",
        paragraphs: [
          "Technical references explain what exists, but teams also need to know why it exists. A short decision record should name the context, the options considered, the choice made, and the consequences accepted. This history prevents future engineers from assuming an odd-looking constraint is accidental. It also makes it easier to revisit the decision when its original conditions change.",
        ],
      },
      {
        heading: "Keep writing close to the work",
        paragraphs: [
          "Documentation decays when updating it requires a separate ceremony. Store operational notes beside the code they describe. Add a checklist to the pull request that changes the process. Give every important document an owner and a visible review date. Prefer a short, current explanation over an impressive handbook nobody trusts.",
        ],
      },
      {
        heading: "Writing improves the decision",
        paragraphs: [
          "The act of explaining a plan often reveals what conversation hides. Ambiguous terms become obvious. Missing evidence creates an uncomfortable blank. Disagreement becomes specific enough to resolve. Healthy teams write not because they distrust conversation, but because writing slows reasoning just enough to make it inspectable. The document is useful later; the clarity it creates is useful now.",
        ],
      },
    ],
  },
  {
    id: 10,
    author: "Owen Clarke",
    initials: "OC",
    role: "Team coach",
    date: "May 15",
    title: "Leadership is the work of creating clarity",
    description:
      "People do their best work when they understand what matters, why it matters, and where they have room to decide. Clear leadership replaces unnecessary control with useful context.",
    readTime: "6 min read",
    tags: ["Leadership", "Career"],
    likes: 221,
    color: "#e1ccff",
    body: [
      {
        heading: "More direction is not more control",
        paragraphs: [
          "When work drifts, leaders often add oversight: more approvals, more status meetings, and more detailed instructions. These mechanisms can create movement, but they also teach people to wait. The underlying problem is frequently not a lack of control. It is a lack of shared clarity about the outcome.",
          "Clear leadership gives people enough context to make good local decisions. It names what matters now, the constraints that cannot be ignored, and the tradeoffs the organization is willing to make.",
        ],
      },
      {
        heading: "Repeat the important things",
        paragraphs: [
          "Leaders are often bored by a message before the rest of the organization has heard it clearly. Priorities need repetition across plans, reviews, hiring, and everyday decisions. If a stated priority disappears when resources are allocated, people will correctly believe the resource decision. Consistency makes the message credible.",
        ],
      },
      {
        heading: "Define the decision space",
        paragraphs: [
          "Autonomy is not the absence of boundaries. Tell teams which decisions they own, which require consultation, and what evidence should guide them. Explain the reason behind constraints so people can respond intelligently when circumstances change. A clear decision space reduces both hesitation and accidental overreach.",
        ],
      },
      {
        heading: "Let questions improve the strategy",
        paragraphs: [
          "The act of explaining a plan often reveals what conversation hides. Ambiguous terms become obvious. Missing evidence creates an uncomfortable blank. Disagreement becomes specific enough to resolve. Healthy teams write not because they distrust conversation, but because writing slows reasoning just enough to make it inspectable. The document is useful later; the clarity it creates is useful now.",
        ],
      },
    ],
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
  "Engineering",
  "Leadership",
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

function BackIcon() {
  return (
    <Icon size={18}>
      <path d="M19 12H5M10 7l-5 5 5 5" />
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

function ArticleReader({
  article,
  isSaved,
  onBack,
  onSave,
  onSelect,
}: {
  article: Article;
  isSaved: boolean;
  onBack: () => void;
  onSave: () => void;
  onSelect: (article: Article) => void;
}) {
  const relatedArticles = articles
    .filter(
      (item) =>
        item.id !== article.id &&
        item.tags.some((tag) => article.tags.includes(tag)),
    )
    .slice(0, 2);

  return (
    <main className="reader">
      <div className="reader-progress" aria-hidden="true" />
      <div className="reader-toolbar">
        <button type="button" onClick={onBack}>
          <BackIcon />
          Back to stories
        </button>
        <button
          className={isSaved ? "reader-save saved" : "reader-save"}
          type="button"
          onClick={onSave}
        >
          <BookmarkIcon filled={isSaved} />
          {isSaved ? "Saved" : "Save story"}
        </button>
      </div>

      <article className="reader-article">
        <header className="reader-header">
          <div className="reader-tags">
            {article.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <h1>{article.title}</h1>
          <p className="reader-deck">{article.description}</p>
          <div className="reader-byline">
            <span
              className="author-avatar"
              style={{ background: article.color }}
            >
              {article.initials}
            </span>
            <p>
              <strong>{article.author}</strong>
              <span>
                {article.role} · {article.date} · {article.readTime}
              </span>
            </p>
          </div>
        </header>

        <div className="reader-visual" style={{ background: article.color }}>
          <span>{String(article.id).padStart(2, "0")}</span>
          <i />
          <b aria-hidden="true">✦</b>
        </div>

        <div className="reader-layout">
          <aside className="reader-aside">
            <span>Story {String(article.id).padStart(2, "0")}</span>
            <p>{article.likes} appreciations</p>
          </aside>
          <div className="reader-body">
            {article.body.map((section, index) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    className={index === 0 ? "reader-opening" : ""}
                    key={paragraph}
                  >
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
            <div className="reader-end" aria-label="End of article">
              <span>✦</span>
            </div>
          </div>
        </div>

        <footer className="reader-author-card">
          <span className="author-avatar" style={{ background: article.color }}>
            {article.initials}
          </span>
          <div>
            <p>Written by</p>
            <h3>{article.author}</h3>
            <span>
              {article.role}. Writing about{" "}
              {article.tags.join(" and ").toLowerCase()}.
            </span>
          </div>
        </footer>
      </article>

      {relatedArticles.length > 0 && (
        <section className="reader-related">
          <div>
            <p className="section-eyebrow">Keep reading</p>
            <h2>More ideas to explore</h2>
          </div>
          <div className="reader-related-grid">
            {relatedArticles.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelect(item)}
              >
                <span style={{ background: item.color }}>
                  {String(item.id).padStart(2, "0")}
                </span>
                <small>{item.tags.join(" · ")}</small>
                <h3>{item.title}</h3>
                <p>
                  {item.readTime} <ArrowIcon />
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function App() {
  const [feed, setFeed] = useState<"For you" | "Following">("For you");
  const [activeTag, setActiveTag] = useState("All topics");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

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

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    requestAnimationFrame(() => {
      document
        .querySelector("#stories")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const toggleSaved = (articleId: number) => {
    setSaved((current) =>
      current.includes(articleId)
        ? current.filter((id) => id !== articleId)
        : [...current, articleId],
    );
  };

  if (selectedArticle) {
    return (
      <div className="app-shell">
        <header className="site-header reader-site-header">
          <button
            className="brand"
            type="button"
            aria-label="Return to Conduit home"
            onClick={closeArticle}
          >
            c<span aria-hidden="true">/</span>conduit
          </button>
          <p>Conduit journal</p>
          <button className="join-button" type="button" onClick={closeArticle}>
            Discover more
          </button>
        </header>
        <ArticleReader
          article={selectedArticle}
          isSaved={saved.includes(selectedArticle.id)}
          onBack={closeArticle}
          onSave={() => toggleSaved(selectedArticle.id)}
          onSelect={openArticle}
        />
      </div>
    );
  }

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
                <span>EP</span>
                <span>MR</span>
                <span>PS</span>
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
                <span className="author-avatar">EP</span>
                <span>
                  <strong>Elena Park</strong>
                  <small>7 min read</small>
                </span>
              </div>
              <h2>The case for designing slower</h2>
              <button type="button" onClick={() => openArticle(articles[0])}>
                Read featured story <ArrowIcon />
              </button>
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
                      <button
                        type="button"
                        className="article-title-link"
                        onClick={() => openArticle(article)}
                      >
                        <h3>{article.title}</h3>
                      </button>
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
                            onClick={() => toggleSaved(article.id)}
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
