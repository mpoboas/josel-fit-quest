# FitQuest

# **For ease of use, please try the app at [https://josel-fit-quest.netlify.app/](https://josel-fit-quest.netlify.app/)**

---

Interactive **mockup** of a mobile fitness app, built as the practical deliverable for a **university course on serious games and gamification** (JOSEL). It illustrates a written **gamification strategy** for a gym-focused product: XP and ranks, streaks, quests, leaderboards, social feed, motivation profiling, and analytics.

This repository is **not a production app**. There is no real backend, accounts, or push notifications. Progress, friends, and leaderboards are simulated in the browser (local storage) so flows can be explored end-to-end. The goal is to show **what the experience could look and feel like**, not to ship a fully functional fitness platform.

### What you can try in the mockup

- Log workouts (sets, reps, weight, PRs) and see XP / streak updates
- Daily, weekly, and Boss challenges with auto-tracked progress
- Friends and global leaderboards, weekly sprint, category leaders
- Profile: badges, Octalysis-style motivation profile, analytics (unlocked after enough sessions in normal play; demo mode unlocks sooner)
- Onboarding survey + motivation quiz; optional demo seed via Profile → Settings

---

## Run locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in a browser (mobile viewport recommended).

### Production build

```bash
npm run build
npm start
```

Serves the built app on port 3000 (see `server.ts`).
