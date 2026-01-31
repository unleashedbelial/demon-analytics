// 👹 Demon Analytics - Frontend

const API_BASE = '/api'; // Will be proxied in production

// Agent tokens to track
const AGENT_TOKENS = [
    { symbol: 'OPENCLAW', address: '8okpu3OBEISmrvc9yM9Y6E9YZYgQR6zRbfHqcJqBXBcw', chain: 'solana' },
    { symbol: 'BELIAL', address: '5aZvoPUQjReSSf38hciLYHGZb8CLBSRP6LeBBraVZrHh', chain: 'solana' },
    { symbol: 'MOLTBOOK', address: '8BqUywx1xRhuYDXs6jHT4LJBx2VAEpBSZpqHkfhWkmoo', chain: 'solana' },
    { symbol: 'CLAWNCH', address: 'An7cPAp4eMi1y8sCJXgJhz9MnA1tPHUTuZXbGT5pLs12', chain: 'solana' },
    { symbol: 'SHELLRAISER', address: 'EgYbUzxTKEfa5V9uGNSEeKa2Ew9xWVLfFd1jAoA8vJtQ', chain: 'solana' },
    { symbol: 'MOLTNET', address: 'HjECU9f8FfKQdH1C5iPWcPQuRHhueZuikqrXbsQuf6aF', chain: 'solana' },
];

// Format numbers
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

function formatPrice(price) {
    if (price < 0.00001) return price.toExponential(2);
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    return price.toFixed(2);
}

// Fetch token data from DexScreener
async function fetchTokenData(address) {
    try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        const data = await res.json();
        if (data.pairs && data.pairs.length > 0) {
            // Get the pair with highest liquidity
            const pair = data.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
            return {
                price: parseFloat(pair.priceUsd) || 0,
                priceChange24h: parseFloat(pair.priceChange?.h24) || 0,
                volume24h: parseFloat(pair.volume?.h24) || 0,
                marketCap: parseFloat(pair.marketCap) || 0,
                liquidity: parseFloat(pair.liquidity?.usd) || 0,
            };
        }
    } catch (err) {
        console.error('Error fetching token:', address, err);
    }
    return null;
}

// Render token card
function renderTokenCard(token, data) {
    if (!data) return '';
    
    const changeClass = data.priceChange24h >= 0 ? 'positive' : 'negative';
    const changeSign = data.priceChange24h >= 0 ? '+' : '';
    
    return `
        <div class="token-card">
            <div class="token-header">
                <span class="token-name">${token.symbol}</span>
                <span class="token-change ${changeClass}">${changeSign}${data.priceChange24h.toFixed(2)}%</span>
            </div>
            <div class="token-price">$${formatPrice(data.price)}</div>
            <div class="token-stats">
                <span>MCap: $${formatNumber(data.marketCap)}</span>
                <span>Vol: $${formatNumber(data.volume24h)}</span>
            </div>
        </div>
    `;
}

// Update overview stats
function updateOverviewStats(tokensData) {
    const totalMcap = tokensData.reduce((sum, t) => sum + (t.data?.marketCap || 0), 0);
    const totalVolume = tokensData.reduce((sum, t) => sum + (t.data?.volume24h || 0), 0);
    
    document.getElementById('total-mcap').textContent = '$' + formatNumber(totalMcap);
    document.getElementById('total-volume').textContent = '$' + formatNumber(totalVolume);
    document.getElementById('tokens-launched').textContent = tokensData.filter(t => t.data).length;
}

// Main update function
async function updateDashboard() {
    console.log('👹 Updating Demon Analytics...');
    
    // Fetch all token data
    const tokensData = await Promise.all(
        AGENT_TOKENS.map(async (token) => ({
            token,
            data: await fetchTokenData(token.address)
        }))
    );
    
    // Render tokens grid
    const tokensGrid = document.getElementById('tokens-grid');
    const validTokens = tokensData.filter(t => t.data);
    
    if (validTokens.length > 0) {
        tokensGrid.innerHTML = validTokens
            .sort((a, b) => (b.data.marketCap || 0) - (a.data.marketCap || 0))
            .map(t => renderTokenCard(t.token, t.data))
            .join('');
    } else {
        tokensGrid.innerHTML = '<p>No token data available</p>';
    }
    
    // Update overview
    updateOverviewStats(tokensData);
    
    // Update timestamp
    document.getElementById('last-update').textContent = new Date().toLocaleString();
    
    console.log('✅ Dashboard updated');
}

// Placeholder for Moltbook stats
function updateMoltbookStats() {
    const moltbookStats = document.getElementById('moltbook-stats');
    moltbookStats.innerHTML = `
        <p>🚧 Moltbook integration coming soon...</p>
        <p style="color: var(--text-secondary); margin-top: 0.5rem;">
            We're working on tracking agent activity, posts, and karma.
        </p>
    `;
}

// Placeholder for activity feed
function updateActivityFeed() {
    const activityFeed = document.getElementById('activity-feed');
    activityFeed.innerHTML = `
        <div class="activity-item">
            <span class="activity-icon">🚀</span>
            <span class="activity-text">Dashboard launched by The Demon Collective</span>
            <span class="activity-time">Just now</span>
        </div>
        <div class="activity-item">
            <span class="activity-icon">👹</span>
            <span class="activity-text">BELIAL is watching the ecosystem</span>
            <span class="activity-time">Always</span>
        </div>
    `;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    updateMoltbookStats();
    updateActivityFeed();
    
    // Auto-refresh every 60 seconds
    setInterval(updateDashboard, 60000);
});
