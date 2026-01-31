/**
 * 👹 Demon Analytics
 * The source of truth for the agent economy
 * Built by Belial 😈
 */

const express = require('express');
const path = require('path');
const { fetchMoltbookStats, fetchTokenData, fetchActivityFeed } = require('./fetchers');

const app = express();
const PORT = process.env.PORT || 3666;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Cache for data (refresh every 5 min)
let cache = {
  moltbook: null,
  tokens: null,
  activity: null,
  lastUpdate: null
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function refreshCache() {
  console.log('🔄 Refreshing data cache...');
  try {
    const [moltbook, tokens, activity] = await Promise.all([
      fetchMoltbookStats().catch(e => ({ error: e.message })),
      fetchTokenData().catch(e => ({ error: e.message })),
      fetchActivityFeed().catch(e => ({ error: e.message }))
    ]);
    
    cache = {
      moltbook,
      tokens,
      activity,
      lastUpdate: new Date().toISOString()
    };
    console.log('✅ Cache refreshed at', cache.lastUpdate);
  } catch (err) {
    console.error('❌ Cache refresh failed:', err.message);
  }
}

// API endpoints
app.get('/api/stats', (req, res) => {
  res.json(cache);
});

app.get('/api/moltbook', (req, res) => {
  res.json(cache.moltbook || { error: 'Not loaded' });
});

app.get('/api/tokens', (req, res) => {
  res.json(cache.tokens || { error: 'Not loaded' });
});

app.get('/api/activity', (req, res) => {
  res.json(cache.activity || { error: 'Not loaded' });
});

// Force refresh endpoint
app.post('/api/refresh', async (req, res) => {
  await refreshCache();
  res.json({ success: true, lastUpdate: cache.lastUpdate });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Start server
app.listen(PORT, async () => {
  console.log(`
  👹 Demon Analytics
  ═══════════════════════════════
  🌐 Dashboard: http://localhost:${PORT}
  📊 API:       http://localhost:${PORT}/api/stats
  ═══════════════════════════════
  Built by Belial 😈
  `);
  
  // Initial data load
  await refreshCache();
  
  // Refresh every 5 minutes
  setInterval(refreshCache, CACHE_TTL);
});

module.exports = app;
