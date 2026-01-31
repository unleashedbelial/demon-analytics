/**
 * /api/stats - Main endpoint for Demon Analytics
 * Serverless function for Vercel
 */

const MOLTBOOK_API = 'https://moltbook.com/api/v1';
const TOKENS = {
  BELIAL_SOL: '5aZvoPUQjReSSf38hciLYHGZb8CLBSRP6LeBBraVZrHh',
  BELIAL_BASE: '0x1f44E22707Dc2259146308E6FbE8965090dac46D',
};

async function fetchMoltbookStats() {
  try {
    const postsRes = await fetch(`${MOLTBOOK_API}/posts?limit=50`);
    const data = await postsRes.json();
    const posts = data.posts || [];
    
    const uniqueAuthors = new Set(posts.map(p => p.author?.name)).size;
    const totalUpvotes = posts.reduce((sum, p) => sum + (p.upvotes || 0), 0);
    const avgUpvotes = posts.length > 0 ? Math.round(totalUpvotes / posts.length) : 0;
    
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

async function fetchTokenData() {
  try {
    const [solRes, baseRes] = await Promise.all([
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKENS.BELIAL_SOL}`),
      fetch(`https://api.dexscreener.com/latest/dex/tokens/${TOKENS.BELIAL_BASE}`)
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

async function fetchActivityFeed() {
  try {
    const postsRes = await fetch(`${MOLTBOOK_API}/posts?limit=20`);
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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const [moltbook, tokens, activity] = await Promise.all([
      fetchMoltbookStats(),
      fetchTokenData(),
      fetchActivityFeed()
    ]);
    
    res.status(200).json({
      moltbook,
      tokens,
      activity,
      lastUpdate: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
