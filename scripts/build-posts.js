const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const postsFile = path.join(root, "content", "posts.json");
const postsDir = path.join(root, "posts");
const posts = JSON.parse(fs.readFileSync(postsFile, "utf8"));

const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const assertPosts = () => {
  const ids = new Set();
  const slugs = new Set();
  for (const post of posts) {
    if (!/^\d{3}$/.test(post.id)) throw new Error(`Post id must use three digits: ${post.id}`);
    if (!/^[a-z0-9-]+$/.test(post.slug)) throw new Error(`Invalid slug: ${post.slug}`);
    if (ids.has(post.id) || slugs.has(post.slug)) throw new Error(`Duplicate post: ${post.id}`);
    if (!post.title || !post.date || !post.summary || !Array.isArray(post.sections)) {
      throw new Error(`Missing required fields in post ${post.id}`);
    }
    ids.add(post.id);
    slugs.add(post.slug);
  }
};

const filename = (post) => `${post.id}-${post.slug}.html`;

const navItem = (post, direction) => post
  ? `<a href="${filename(post)}"><small>${direction}</small><strong>${direction === "PREVIOUS POST" ? "← " : ""}${escapeHtml(post.title)}${direction === "NEXT POST" ? " →" : ""}</strong></a>`
  : `<a class="disabled" aria-disabled="true"><small>${direction}</small><strong>${direction === "PREVIOUS POST" ? "← NO ENTRY" : "LOCKED →"}</strong></a>`;

const renderBody = (post) => post.sections.map((section, sectionIndex) => {
  const heading = section.heading ? `\n        <h2>${escapeHtml(section.heading)}</h2>` : "";
  const paragraphs = (section.paragraphs || []).map((paragraph, paragraphIndex) => {
    const dropcap = sectionIndex === 0 && paragraphIndex === 0 ? ' class="dropcap"' : "";
    return `        <p${dropcap}>${escapeHtml(paragraph)}</p>`;
  }).join("\n");
  return `${heading}\n${paragraphs}`;
}).join("\n");

const renderImages = (post) => {
  const images = post.images || (post.image ? [post.image] : []);
  if (!images.length) return "";
  const figures = images.map((item) => {
    const caption = item.caption ? `<figcaption>${escapeHtml(item.caption)}</figcaption>` : "";
    return `        <figure class="entry-image"><img src="../${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || "")}" loading="lazy">${caption}</figure>`;
  }).join("\n");
  return `\n      <div class="entry-gallery">\n${figures}\n      </div>`;
};

const renderPost = (post, index) => `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#07090f"><meta name="description" content="${escapeHtml(post.summary)}">
  <title>${post.id} ${escapeHtml(post.title)} — BLOG</title><link rel="stylesheet" href="../assets/style.css"><script defer src="../assets/app.js"></script>
</head>
<body>
  <div class="noise" aria-hidden="true"></div><div class="scanlines" aria-hidden="true"></div>
  <header class="site-header">
    <a class="brand" href="../index.html"><span class="brand-mark">◆</span><span><strong>BLOG</strong></span></a>
  </header>
  <main class="shell article-shell"><article>
    <header class="article-header"><div class="article-kicker"><span>ENTRY ${post.id}</span><span>${escapeHtml(post.date)}</span><span>${escapeHtml(post.category)}</span></div><h1>${escapeHtml(post.title)}</h1><p class="article-subtitle">${escapeHtml(post.subtitle)}</p></header>
    <div class="article-body panel">${renderImages(post)}${renderBody(post)}
      <div class="entry-end"><span>END OF ENTRY ${post.id}</span><span class="blink">■</span></div>
    </div>
    <nav class="post-nav compact" aria-label="記事ナビゲーション">
      ${navItem(posts[index - 1], "PREVIOUS POST")}
      ${navItem(posts[index + 1], "NEXT POST")}
    </nav>
  </article></main>
  <footer class="site-footer"><span>© 2026 BLOG</span><span>ENTRY // ${post.id}</span></footer>
</body>
</html>
`;

const renderCard = (post, featured = false) => `      <article class="post-card${featured ? " featured" : ""}">
        <a class="post-link" href="posts/${filename(post)}">
          <div class="post-number">${post.id}</div>
          <div class="post-meta"><span>${escapeHtml(post.date)}</span><span>${escapeHtml(post.category)}</span></div>
          <h3>${escapeHtml(post.title)}</h3><p>${escapeHtml(post.summary)}</p>
          <div class="post-footer"><span>READ LOG</span><span>→</span></div>
        </a>
      </article>`;

const replaceGeneratedSection = (file, content) => {
  const source = fs.readFileSync(file, "utf8");
  const markers = /    <!-- POSTS:START -->[\s\S]*?    <!-- POSTS:END -->/;
  if (!markers.test(source)) throw new Error(`Could not find post markers in ${file}`);
  const updated = source.replace(markers, `    <!-- POSTS:START -->\n${content}\n    <!-- POSTS:END -->`);
  fs.writeFileSync(file, updated);
};

assertPosts();
posts.sort((a, b) => a.id.localeCompare(b.id));
fs.mkdirSync(postsDir, { recursive: true });
posts.forEach((post, index) => fs.writeFileSync(path.join(postsDir, filename(post)), renderPost(post, index)));

const recent = [...posts].reverse().slice(0, 2);
const cards = recent.map((post, index) => renderCard(post, index === 0)).join("\n");
const indexFile = path.join(root, "index.html");
replaceGeneratedSection(indexFile, `    <section class="post-grid">\n${cards}\n    </section>`);
const latest = posts.at(-1);
let home = fs.readFileSync(indexFile, "utf8");
home = home
  .replace(/href="posts\/[^"]+">READ ENTRY \d{3}/, `href="posts/${filename(latest)}">READ ENTRY ${latest.id}`)
  .replace(/(<span>ENTRIES<\/span><strong>)\d{3}(<\/strong>)/, `$1${String(posts.length).padStart(3, "0")}$2`)
  .replace(/(<span class="counter">)\d+ \/ \d+(<\/span>)/, `$1${String(recent.length).padStart(2, "0")} / ${String(posts.length).padStart(2, "0")}$2`);
fs.writeFileSync(indexFile, home);

const rows = [...posts].reverse().map((post) => `      <a class="archive-row" href="posts/${filename(post)}"><span class="archive-id">${post.id}</span><span class="archive-date">${escapeHtml(post.date)}</span><span class="archive-title">${escapeHtml(post.title)}</span><span class="archive-tag">${escapeHtml(post.category)}</span><span class="archive-arrow">→</span></a>`).join("\n");
replaceGeneratedSection(path.join(root, "archive.html"), `    <section class="archive-list">\n${rows}\n    </section>`);

console.log(`Built ${posts.length} post${posts.length === 1 ? "" : "s"}.`);
