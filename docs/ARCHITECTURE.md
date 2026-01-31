# 🏗️ Demon Analytics - Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DEMON ANALYTICS                          │
│                 "The Agent Economy Dashboard"               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Moltbook   │  │ DexScreener │  │   Clawnch   │        │
│  │   Scraper   │  │     API     │  │   Tracker   │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          ▼                                 │
│                 ┌─────────────────┐                        │
│                 │   Data Layer    │                        │
│                 │   (JSON/SQLite) │                        │
│                 └────────┬────────┘                        │
│                          │                                 │
│                          ▼                                 │
│                 ┌─────────────────┐                        │
│                 │    REST API     │                        │
│                 │   (Node.js)     │                        │
│                 └────────┬────────┘                        │
│                          │                                 │
│                          ▼                                 │
│                 ┌─────────────────┐                        │
│                 │    Frontend     │                        │
│                 │  (HTML/JS/CSS)  │                        │
│                 └─────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Sources

### 1. Moltbook
- **URL**: https://moltbook.com
- **Method**: API (if available) or scraping
- **Data**: 
  - Total agents registered
  - Posts per day/hour
  - Top agents by karma
  - Trending posts
  - Community stats

### 2. DexScreener
- **URL**: https://api.dexscreener.com
- **Method**: REST API (public)
- **Data**:
  - Agent tokens (OPENCLAW, MOLT, CLAWNCH, BELIAL, etc.)
  - Market caps
  - 24h volume
  - Price changes
  - Trending tokens

### 3. Clawnch
- **URL**: TBD (need to investigate)
- **Method**: Scraping or API
- **Data**:
  - Tokens launched
  - Total fees earned
  - Top performing launches

### 4. Pump.fun
- **URL**: https://pump.fun
- **Method**: API
- **Data**:
  - Solana agent tokens
  - Launch activity
  - Trading volume

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js (minimal)
- **Data**: JSON files → SQLite (later)
- **Cron**: node-cron for periodic updates

### Frontend
- **Approach**: Static site (no build step)
- **UI**: Vanilla JS + CSS (fast, simple)
- **Charts**: Chart.js or lightweight alternative
- **Hosting**: Vercel / Netlify / GitHub Pages

### Infrastructure
- **Updates**: Every 5-15 minutes
- **Cache**: In-memory + file-based
- **Alerts**: Telegram bot (optional)

## API Endpoints (planned)

```
GET /api/stats           - Overall ecosystem stats
GET /api/moltbook        - Moltbook metrics
GET /api/tokens          - Agent tokens data
GET /api/tokens/:symbol  - Specific token
GET /api/trending        - What's hot
GET /api/activity        - Recent activity feed
```

## MVP Scope

### Phase 1 (Day 1-2)
- [ ] DexScreener integration (tokens data)
- [ ] Basic frontend with stats
- [ ] Deploy to Vercel

### Phase 2 (Day 3-5)
- [ ] Moltbook data (scraping if needed)
- [ ] Better UI/UX
- [ ] Historical data tracking

### Phase 3 (Week 2+)
- [ ] Clawnch integration
- [ ] Public API
- [ ] Alerts system
- [ ] Premium features

## Branding

- **Name**: Demon Analytics
- **Tagline**: "The source of truth for the agent economy"
- **Colors**: Dark theme, red accents (demon vibes)
- **Logo**: 👹 or custom demon eye design
- **Built by**: The Demon Collective / $BELIAL

---
*Last updated: 2026-01-31*
