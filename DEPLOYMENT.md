# GitHub Pages Deployment Guide

## ✅ Configuration Complete

Your site is now configured for deployment to GitHub Pages at:
**https://vugar1101.github.io/Web-portfolio/**

## Changes Made

1. **`_config.yml`**:
   - `baseurl: "/Web-portfolio"` - Set to your repository name
   - `url: "https://vugar1101.github.io"` - Set to your GitHub Pages domain

2. **`assets/main.scss`**:
   - Removed empty front matter that was causing errors

3. **`_sass/custom.scss`**:
   - Changed background image path from absolute (`/assets/img/portfolio-bg.jpg`) to relative (`../img/portfolio-bg.jpg`) for GitHub Pages compatibility

## Deployment Steps

### Option 1: Deploy via GitHub Actions (Recommended)

1. **Create `.github/workflows/jekyll.yml`**:
```yaml
name: Jekyll site CI

on:
  push:
    branches:
      - main  # or 'master' if that's your default branch
  pull_request:

jobs:
  github-pages:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.1'
          bundler-cache: true
      - uses: actions/configure-pages@v2
      - uses: actions/upload-pages-artifact@v1
        with:
          path: ./_site
      - name: Setup Pages
        uses: actions/deploy-pages@v1
```

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages"
   git push origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository → Settings → Pages
   - Source: Select "GitHub Actions"

### Option 2: Deploy via gh-pages Branch (Alternative)

1. **Build locally**:
   ```bash
   bundle exec jekyll build
   ```

2. **Push _site folder to gh-pages branch**:
   ```bash
   git subtree push --prefix _site origin gh-pages
   ```

3. **Enable GitHub Pages**:
   - Go to repository → Settings → Pages
   - Source: Select "gh-pages" branch

## Important Notes

- ✅ All asset paths use `relative_url` filter (already configured)
- ✅ Baseurl is set correctly for repository name
- ✅ CSS uses relative paths for images
- ✅ All navigation links use `relative_url` filter

## Testing Locally with Baseurl

To test locally with the same baseurl as production:

```bash
bundle exec jekyll serve --baseurl "/Web-portfolio"
```

Then visit: `http://localhost:4000/Web-portfolio/`

## Repository Requirements

- Repository name: `Web-portfolio` (must match baseurl)
- Default branch: `main` or `master`
- GitHub Pages enabled in repository settings

## Troubleshooting

If assets don't load:
1. Check that `baseurl` in `_config.yml` matches your repository name exactly
2. Verify all asset paths use `relative_url` filter
3. Clear browser cache and hard refresh (Ctrl+F5)

## After Deployment

Your site will be available at:
- **https://vugar1101.github.io/Web-portfolio/**

All functionality and display will remain the same as your local version!

