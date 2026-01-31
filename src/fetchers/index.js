/**
 * Data Fetchers for Demon Analytics
 */

// Use dynamic import for node-fetch (ESM module)
async function fetchWithNodeFetch(url, opts) {
  const { default: fetch } = await import('node-fetch');
  return fetch(url, opts);
}

// Moltbook API
const MOLTBOOK_API = 'https://moltbook.com/api/v1';

// Token addresses
const TOKENS = {
  BELIAL_SOL: '5aZvoPUQjReSSf38hciLYHGZb8CLBSRP6LeBBraVZrHh',
  BELIAL_BASE: '0x1f44E22707Dc2259146308E6FbE8965090dac46D',
};

/**
 * Fetch Moltbook ecosystem stats
 */
async function fetchMoltbookStats() {
  try {
    // Fetch trending posts to gauge activity
    const postsRes = await fetchWithNodeFetch(`${MOLTBOOK_API}/posts?limit=50`);
    const data = await postsRes.json();
    const posts = data.posts || [];
    
    // Calculate stats from posts
    const uniqueAuthors = new Set(posts.map(p => p.author?.name)).size;
    const totalUpvotes = posts.reduce((sum, p) => sum + (p.upvotes || 0), 0);
    const avgUpvotes = posts.length > 0 ? Math.round(totalUpvotes / posts.length) : 0;
    
    // Get top agents by karma (from posts)
    const authorKarma = {};
    posts.forEach(p => {
      if (p.author?.name) {
        authorKarma[p.author.name] = (authorKarma[p.author.name] || 0) + (p.upvotes || 0);
      }
    });
    
    const topAgents = Object.entries(authorKarma)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([username, karma]) => ({ username, karma }));
    
    return {
      posts: {
        trending: posts.slice(0, 10).map(p => ({
          id: p.id,
          title: p.title,
          author: p.author?.name,
          upvotes: p.upvotes,
          submolt: p.submolt?.name,
          createdAt: p.created_at
        })),
        totalSampled: posts.length,
        uniqueAuthors,
        avgUpvotes
      },
      topAgents,
      fetchedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Moltbook fetch error:', err.message);
    return { error: err.message };
  }
}

/**
 * Fetch token data from DexScreener
 */
async function fetchTokenData() {
  try {
    // DexScreener API for token data
    const [solRes, baseRes] = await Promise.all([
      fetchWithNodeFetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKENS.BELIAL_SOL}`),
      fetchWithNodeFetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKENS.BELIAL_BASE}`)
    ]);
    
    const solData = await solRes.json();
    const baseData = await baseRes.json();
    
    const formatToken = (data, chain) => {
      const pair = data.pairs?.[0];
      if (!pair) return { chain, error: 'No pair data' };
      
      return {
        chain,
        name: pair.baseToken?.name,
        symbol: pair.baseToken?.symbol,
        price: pair.priceUsd,
        priceChange24h: pair.priceChange?.h24,
        volume24h: pair.volume?.h24,
        liquidity: pair.liquidity?.usd,
        fdv: pair.fdv,
        dexUrl: pair.url
      };
    };
    
    return {
      belial: {
        solana: formatToken(solData, 'solana'),
        base: formatToken(baseData, 'base')
      },
      fetchedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Token fetch error:', err.message);
    return { error: err.message };
  }
}

/**
 * Fetch activity feed (combined Moltbook + token activity)
 */
async function fetchActivityFeed() {
  try {
    // Get recent posts
    const postsRes = await fetchWithNodeFetch(`${MOLTBOOK_API}/posts?limit=20`);
    const data = await postsRes.json();
    const posts = data.posts || [];
    
    const activities = posts.map(p => ({
      type: 'moltbook_post',
      title: p.title,
      author: p.author?.name,
      submolt: p.submolt?.name,
      upvotes: p.upvotes,
      url: `https://moltbook.com/post/${p.id}`,
      timestamp: p.created_at
    }));
    
    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      activities: activities.slice(0, 20),
      fetchedAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Activity fetch error:', err.message);
    return { error: err.message };
  }
}

module.exports = {
  fetchMoltbookStats,
  fetchTokenData,
  fetchActivityFeed
};
