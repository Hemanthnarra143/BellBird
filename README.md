# BellBird

A production-oriented full-stack social media MVP.

## Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Zustand (State Management), React Router, Lucide React (Icons).
- **Backend**: Node.js, Express, Mock In-Memory Database.
- **Shared Codebase**: Developed as a responsive Progressive Web App (PWA) layout that acts as a shared codebase for iOS, Android, and Web browsers.

## Features
- **Mock Authentication**: Simple demo login to test features.
- **Feed with Pull-to-Refresh Gesture**:
  - Native touch gesture handler (`onTouchStart`, `onTouchMove`, `onTouchEnd`) with damped rubber-band resistance curve.
  - Twitter-style drop bubble indicator with progressive rotation and animated spinner on release.
  - Smooth settling transition and "Updated" status toast.
  - Desktop mouse-drag compatibility for browser preview testing.
  - Top-right corner BellBird brand emblem logo.
- **Twitter-style Search & Explore**:
  - Pinned search button in the bottom navigation bar (mobile) and sidebar (desktop).
  - Search across all content: text posts, usernames, display names, bios, and `#hashtags`.
  - Filter tabs: `Top`, `Latest`, `People`, and `Media`.
  - "Trends for you" and "Popular Topics" explore hub with chirp volume metrics.
  - Recent searches history with quick re-querying and one-click clear.
  - Clickable `#hashtags` in posts that navigate directly to hashtag search results.
- **Twitter-style Post Buttons & Compose Modal**:
  - **Mobile Floating Action Button (FAB)**: Feather icon in an ergonomic circular floating button (`bottom-20 right-4`) above the bottom nav bar, accessible anywhere in the app.
  - **Desktop Sidebar Post Button**: Prominent pill button in the left sidebar with feather icon.
  - **Full Compose Modal**: Twitter/X-style compose sheet featuring auto-focus textarea, 280-character live circular progress meter, audience badge ("Everyone can reply"), photo attachment preview/selector, and clickable hashtag accelerators (`#BellBird`, `#Tech`, `#Design`).
  - **Instant Publishing**: Posts published via the modal automatically appear at the top of the feed with zero page refresh needed.
- **Interactions**: Like posts, responsive UI updates.
- **Twitter-style Settings Menu (Single Menu with Dropdown Accordions)**:
  - Accessible via the **Settings** button in the profile header and action bar.
  - **Your account**: Account information editing, username handle, change password, data archive download, deactivation.
  - **Monetization**: Creator subscriptions, tips/tip jar configuration, and ad revenue criteria.
  - **Premium**: Free, Premium ($8/mo), and Premium+ ($16/mo) tiers with instant blue verification checkmark badge activation.
  - **Security and account access**: Two-Factor Authentication (2FA) switch, active session tracking, remote logout.
  - **Privacy and safety**: Protected chirps (private account toggle), DM permissions, read receipts, photo tagging.
  - **Notifications**: Quality filters, push notification toggles, sound effects.
  - **Accessibility, display, and languages**: High contrast mode, reduced motion, data saver, font sizing, media cache clearing.
  - **Additional resources**: Release notes, open source licenses, terms of service, and privacy policy.
  - **Help Center**: FAQs and interactive contact support request submission.
- **Feed Header**: Features the official BellBird logo in the top-right corner.
- **Notifications**: See follow alerts and likes.
- **Direct Messaging**: Mock chat interface for direct messaging.
- **Responsive Layout**: Desktop sidebar navigation with mobile bottom navigation bar.

## Project Structure
```
.
├── server.ts                 # Express backend & mock database
├── src/
│   ├── components/           # Reusable UI components (Layout, PostCard)
│   ├── pages/                # Route pages (Feed, Auth, Profile, etc.)
│   ├── store/                # Zustand global state (Auth)
│   ├── App.tsx               # React Router configuration
│   └── main.tsx              # React entry point
└── package.json              # Scripts & Dependencies
```

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (runs both Express and Vite frontend):
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Deployment
- **Hostinger Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for full step-by-step instructions on deploying to Hostinger via GitHub (supports both Hostinger Node.js and static web hosting with automatic `.htaccess` SPA routing).
- **GitHub Actions**: Automated CI/CD workflow is included in `.github/workflows/deploy.yml`.

To deploy this application to any production environment:

1. **Build the client:**
   ```bash
   npm run build
   ```
   This will output the static frontend files into `dist/client/`.
   
2. **Start the server:**
   Ensure you have `"start": "tsx server.ts"` in your package.json, or pre-compile TypeScript using `tsc` to run purely on Node.js in production for better performance.
   
   ```bash
   npm run start
   ```

3. **Database Setup (Future):**
   This MVP uses an in-memory database. For production, integrate PostgreSQL (e.g., using Cloud SQL) or Firebase. Replace the data arrays in `server.ts` with real database queries.

## Design System
- Primary Brand Color: `#1769FF` (BellBird Blue)
- Dark Mode / Typography: `#0A192F` (Deep Navy)
- Backgrounds: `#FFFFFF` (White) and `gray-50` for subtle contrast.
