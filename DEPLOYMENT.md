# Hostinger Deployment Guide for BellBird via GitHub

This guide walks you through deploying **BellBird** to **Hostinger** from your GitHub repository with zero hassle.

---

## 1. Push Your Code to GitHub

If you haven't pushed this repository to GitHub yet:

```bash
# 1. Initialize git (if not already initialized)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "feat: complete BellBird with Hostinger deployment setup"

# 4. Set main branch and link your GitHub remote
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git

# 5. Push to GitHub
git push -u origin main
```

---

## 2. Choose Your Hostinger Deployment Method

Hostinger offers two primary hosting setups:
- **Option 1: Hostinger Node.js Web App / VPS (Recommended for full-stack with API routes)**
- **Option 2: Hostinger Git / Web Hosting (For static client hosting in `public_html`)**
- **Option 3: Automated GitHub Actions CI/CD (Continuous auto-deploy)**

---

### Option 1: Hostinger Node.js Application (Full-Stack)

Use this if your Hostinger plan includes the **Node.js** feature (Business Web Hosting, Cloud Hosting, or VPS):

1. **Log in to Hostinger hPanel**.
2. Navigate to **Websites** -> select your website -> **Advanced** -> **Node.js**.
3. Configure the Node.js settings:
   - **Node.js version**: `20.x` or `22.x`
   - **Application root**: `/` (or your chosen subfolder)
   - **Application startup file**: `server.js` (Hostinger default) OR `server.ts` (Both are fully supported!)
   - **Custom start script**: `npm start`
4. Add **Environment Variables** in the Node.js panel:
   - `NODE_ENV`: `production`
   - `PORT`: (Hostinger default or `3000`)
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
5. Connect your GitHub repository:
   - Go to **Advanced** -> **Git**.
   - Paste your GitHub repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPO.git`.
   - Branch: `main`.
   - Target directory: `/` (or your app directory).
   - Click **Create**.
6. In Hostinger Terminal / SSH, run the build command:
   ```bash
   npm install
   npm run build:all
   ```
7. Click **Restart Application** in the Hostinger Node.js panel.
8. Your full-stack BellBird app is live!

---

### Option 2: Hostinger Web Hosting via Git (`public_html`)

If you want to host the compiled frontend directly in Hostinger's standard web hosting:

1. In Hostinger **hPanel**, go to **Advanced** -> **Git**.
2. Enter your GitHub repository URL and select branch `main`.
3. Set the target directory to your domain's folder (e.g., `/public_html`).
4. Click **Create & Deploy**.
5. When deploying from Git on Hostinger, run the build step via SSH or Hostinger terminal:
   ```bash
   npm install
   npm run build
   ```
   *(Note: The built files will be located in the `dist` folder. In Hostinger hPanel -> Websites -> Website Settings, change your **Document Root** to `public_html/dist`, or copy the contents of `dist` into `public_html`)*.
6. **Smooth Routing Guarantee**: The included `public/.htaccess` file is automatically copied to `dist/.htaccess` during build. This prevents 404 errors when refreshing pages like `/profile`, `/search`, or `/bookmarks` on Apache/LiteSpeed servers!

---

### Option 3: Automated Deployment via GitHub Actions (Zero-Click)

The repository includes a ready-to-use GitHub Actions workflow located at `.github/workflows/deploy.yml`.

Whenever you push to the `main` branch, GitHub Actions will:
1. Verify TypeScript types and linting (`npm run lint`).
2. Build the production bundle (`npm run build:all`).
3. (Optional) Automatically upload the build to Hostinger via FTP!

#### To enable automatic FTP deployment:
1. In Hostinger hPanel, go to **Files** -> **FTP Accounts** and note down:
   - **FTP Host / Server** (e.g., `ftp.yourdomain.com` or server IP)
   - **FTP Username**
   - **FTP Password**
2. In your GitHub repository:
   - Go to **Settings** -> **Secrets and variables** -> **Actions** -> **New repository secret**.
   - Add these three secrets:
     - `HOSTINGER_FTP_SERVER` -> Your FTP host
     - `HOSTINGER_FTP_USER` -> Your FTP username
     - `HOSTINGER_FTP_PASSWORD` -> Your FTP password
3. Now, whenever you run `git push origin main`, GitHub will build and automatically deploy the latest files to Hostinger!

---

## 3. Hostinger Auto-Deployment Webhook (Alternative)

Hostinger also provides an instant Webhook URL in hPanel:
1. In Hostinger hPanel -> **Advanced** -> **Git**.
2. Copy the **Webhook URL** provided by Hostinger.
3. In your GitHub repository, go to **Settings** -> **Webhooks** -> **Add webhook**.
4. Paste the Webhook URL into **Payload URL**, set Content type to `application/json`, and save.
5. Every push to GitHub will instantly trigger Hostinger to pull the latest changes!

---

## 4. Key Files Included for Hostinger Compatibility

| File | Purpose |
|---|---|
| `public/.htaccess` | Configures Apache/LiteSpeed URL rewrites, gzip/Brotli compression, and caching so SPA routes never 404. |
| `public/_redirects` | Fallback SPA redirect for edge proxies and static hosting. |
| `public/favicon.svg` | Branded BellBird SVG browser icon. |
| `ecosystem.config.cjs` | PM2 cluster configuration for Hostinger Node.js / VPS process management. |
| `.github/workflows/deploy.yml` | GitHub Actions automated test, build, and deploy pipeline. |
| `package.json` | Includes `build:all` (builds both client and server) and `start:prod`. |
| `.gitignore` | Prevents uploading `node_modules/`, `dist/`, or secret `.env` files to GitHub. |
