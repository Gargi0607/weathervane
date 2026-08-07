# Weathervane — a mental health check-in that responds to *what* you're feeling, not just *how much*

A simple mood tracker, but instead of one generic script for every low score, the check-in flow is:

**inner weather (1–5, framed as storm → clear) + what it's about (tags) → a suggestion pulled from a matrix keyed on both.**

That's the core fix for the "same advice every time" problem — see `script.js`, the `MATRIX` object, for the full set of responses per weather × tag combination.

## Files
- `index.html` — page structure
- `style.css` — all styling (design tokens at the top as CSS variables)
- `script.js` — all logic: rendering, the recommendation matrix, localStorage persistence, the trail visualization
- No build step, no dependencies, no backend. Everything lives in the browser's `localStorage`.

## Run it locally
Just open `index.html` in a browser. Or, in VS Code, install the **Live Server** extension, right-click `index.html` → "Open with Live Server."

## Put it on GitHub with a public link (GitHub Pages)

1. **Create a new repo on GitHub**
   Go to github.com → New repository → name it (e.g. `weathervane`) → Create repository. Don't initialize with a README (you already have one).

2. **Push your local folder to it**, from VS Code's terminal inside this project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Weathervane mood tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/weathervane.git
   git push -u origin main
   ```

3. **Turn on GitHub Pages**
   On the repo page: **Settings → Pages** (left sidebar) → under "Build and deployment," set **Source** to `Deploy from a branch` → **Branch**: `main`, folder `/ (root)` → **Save**.

4. **Get your link**
   Wait ~1 minute, refresh that same Settings → Pages screen. GitHub will show:
   `https://YOUR-USERNAME.github.io/weathervane/`
   That's your public link — share it with anyone.

Any time you push new commits to `main`, the live site updates automatically within a minute or two.

## Extending it further
- Swap `localStorage` for a backend (e.g. a small Firebase/Supabase project) if you want data to sync across devices.
- The `MATRIX` object is the easiest place to add more tags or more varied responses per tag — just add keys.
- There's no built-in crisis-resource prompt in this version. If you want to add one back later — especially before sharing this with anyone beyond yourself — `findahelpline.com` routes to the right local helpline based on country, which is more useful than a single US-only number.
