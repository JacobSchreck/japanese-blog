# 夜間通信 / YAKAN TSUSHIN

深夜のアニメ、初期の家庭用ゲーム機、二〇〇〇年代の個人サイトをイメージした、静的な日本語の個人ブログです。

## GitHub Pages で公開する

1. GitHubで新しいリポジトリを作成します。
2. このフォルダの内容をリポジトリのルートへプッシュします。
3. **Settings → Pages** を開きます。
4. **Build and deployment** で **Deploy from a branch** を選択します。
5. Branchを `main`、フォルダを `/ (root)` に設定して保存します。

すべてのリンクは相対パスなので、ユーザーサイトとプロジェクトサイトの両方で動作します。

## 新しい記事を追加する

1. `posts/001-self-introduction.html` を複製します。
2. `posts/002-new-post.html` のように連番を付けて保存します。
3. 記事番号、日付、タイトル、カテゴリー、本文を変更します。
4. `index.html` に新しい記事カードを追加します。
5. `archive.html` に記事の行を追加します。
6. 前後の記事にある Previous Post / Next Post リンクを更新します。

## デザインを変更する

配色、光彩、境界線、背景などは `assets/style.css` 冒頭のCSS変数で調整できます。
