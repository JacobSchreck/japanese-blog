# 夜間通信 / YAKAN TSŪSHIN

A static Japanese personal blog designed for GitHub Pages.

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload everything in this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select:
   - Branch: `main`
   - Folder: `/ (root)`
6. Save.

GitHub will publish the site at a URL similar to:

`https://YOUR-USERNAME.github.io/YOUR-REPO/`

All links in this project are relative, so it works both as a user site and as a project site.

## Add a new post

1. Duplicate `posts/001-self-introduction.html`.
2. Rename it, e.g. `posts/002-my-hometown.html`.
3. Change the entry number, date, title, category, and article content.
4. Add a card on `index.html`.
5. Add a row on `archive.html`.
6. Update the Previous / Next links in neighboring posts.

## Customize

Edit the CSS variables near the top of `assets/style.css` to adjust the glow colors, text, borders, and background.

The first post intentionally contains bracketed placeholders so you can replace them with your actual self-introduction.
