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

const formatText = (value = "") => escapeHtml(value).replaceAll("\n", "<br>");

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

const renderFigure = (item, className = "entry-image") => {
  const caption = item.caption ? `<figcaption>${escapeHtml(item.caption)}</figcaption>` : "";
  return `<figure class="${className}"><span class="media-corner" aria-hidden="true"></span><img src="../${escapeHtml(item.src)}" alt="${escapeHtml(item.alt || "")}" loading="lazy">${caption}</figure>`;
};

const renderVideo = (item) => item?.src
  ? `<figure class="entry-video"><span class="media-corner" aria-hidden="true"></span><video controls playsinline preload="metadata"${item.poster ? ` poster="../${escapeHtml(item.poster)}"` : ""} aria-label="${escapeHtml(item.label || "動画")}"><source src="../${escapeHtml(item.src)}" type="video/mp4">お使いのブラウザは動画の再生に対応していません。</video></figure>`
  : "";

const renderBody = (post) => post.sections.map((section) => {
  const headingTag = section.headingLevel === 3 ? "h3" : "h2";
  const heading = section.heading ? `\n        <${headingTag}>${escapeHtml(section.heading)}</${headingTag}>` : "";
  const paragraphs = (section.paragraphs || []).map((paragraph) => {
    return `        <p>${formatText(paragraph)}</p>`;
  }).join("\n");
  const links = (section.links || []).map((link) => `        <p class="entry-resource"><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a></p>`).join("\n");
  const list = section.list?.length
    ? `        <ul class="entry-list">\n${section.list.map((item) => `          <li>${escapeHtml(item)}</li>`).join("\n")}\n        </ul>`
    : "";
  const video = renderVideo(section.video);
  const sectionImages = (section.images || []).map((item) => `        ${renderFigure(item, "entry-image inline-media")}`).join("\n");
  return `${heading}\n${paragraphs}${links ? `\n${links}` : ""}${list ? `\n${list}` : ""}${video ? `\n        ${video}` : ""}${sectionImages ? `\n${sectionImages}` : ""}`;
}).join("\n");

const renderImages = (post) => {
  const images = post.images || (post.image ? [post.image] : []);
  if (!images.length) return "";
  const figures = images.map((item) => {
    return `        ${renderFigure(item)}`;
  }).join("\n");
  return `\n      <div class="entry-gallery">\n${figures}\n      </div>`;
};

const renderCover = (post) => post.coverImage
  ? `\n      ${renderFigure(post.coverImage, "entry-image cover-media")}`
  : "";

const renderNotes = (post) => {
  if (!post.notes?.length) return "";
  const notes = post.notes.map((note) => `        <p><span>${escapeHtml(note.term)}:</span> ${escapeHtml(note.meaning)}</p>`).join("\n");
  return `\n      <div class="entry-notes" aria-label="単語リスト">\n${notes}\n      </div>`;
};

const renderNoteLines = (post) => {
  if (!post.noteLines?.length) return "";
  const lines = post.noteLines.map((line) => `        <p>${escapeHtml(line)}</p>`).join("\n");
  return `\n      <div class="entry-notes exact-notes" aria-label="単語リスト">\n${lines}\n      </div>`;
};

const renderArticleContent = (post) => {
  const prose = `${renderBody(post)}${renderNotes(post)}${renderNoteLines(post)}`;
  if (post.layout === "split" && post.sideImage) {
    return `\n      <div class="entry-split">\n        <div class="entry-prose">${prose}\n        </div>\n        ${renderFigure(post.sideImage, "entry-image side-media")}\n      </div>${renderImages(post)}`;
  }
  return `${renderCover(post)}${prose}${renderImages(post)}`;
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
  <main class="shell article-shell${post.layout === "split" ? " wide-article" : ""}"><article>
    <header class="article-header"><div class="article-kicker"><span>ENTRY ${post.id}</span><span>${escapeHtml(post.date)}</span><span>${escapeHtml(post.category)}</span></div><h1>${escapeHtml(post.title)}</h1>${post.subtitle ? `<p class="article-subtitle">${escapeHtml(post.subtitle)}</p>` : ""}</header>
    <div class="article-body panel">${renderArticleContent(post)}
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
          <h3>${escapeHtml(post.cardTitle || post.title)}</h3>
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

const recent = [...posts].reverse();
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
