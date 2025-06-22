# Cloudflare Workers CORS Proxy Deployment Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com)
2. Sign up for a free account
3. No credit card required for free tier

### Step 2: Deploy the Worker
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Workers & Pages** in the left sidebar
3. Click **Create Application**
4. Click **Create Worker**
5. Replace the default code with the content from `cloudflare-cors-proxy.js`
6. Click **Save and Deploy**

### Step 3: Get Your Worker URL
- Your worker will be deployed at: `https://your-worker-name.your-subdomain.workers.dev`
- Copy this URL - you'll need it for the plugin

### Step 4: Update Plugin Configuration
Replace `https://corsproxy.io/` with your Cloudflare Worker URL in your plugin code.

## 📊 Pricing Breakdown

### Free Tier (Perfect for Most Plugins)
- **100,000 requests per day** (3M per month)
- **No cost**
- **Global edge network**

### Paid Tier (For High-Volume Plugins)
- **$5/month base cost**
- **10M requests included**
- **$0.30 per additional million requests**

### Real-World Cost Examples:
- **Small plugin** (10k requests/day): **FREE**
- **Medium plugin** (50k requests/day): **FREE**  
- **Large plugin** (200k requests/day): **$5/month**
- **Enterprise plugin** (1M requests/day): **~$14/month**

## 🔧 Advanced Configuration

### Custom Domain (Optional)
1. Add your domain to Cloudflare
2. Go to **Workers & Pages** → **Custom Domains**
3. Add your custom domain (e.g., `cors-proxy.yourdomain.com`)

### Environment Variables
Add these in the Worker dashboard under **Settings** → **Variables**:
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins
- `API_KEY`: Optional API key for authentication

### Rate Limiting
Add rate limiting to prevent abuse:

```javascript
// Add this to the Worker code
const rateLimiter = {
  requests: new Map(),
  
  isAllowed(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100; // per minute
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }
    
    const timestamps = this.requests.get(ip);
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    
    if (validTimestamps.length >= maxRequests) {
      return false;
    }
    
    validTimestamps.push(now);
    this.requests.set(ip, validTimestamps);
    return true;
  }
};
```

## 🛡️ Security Features

### Built-in Security:
- **Domain Whitelist**: Only allows requests to approved domains
- **CORS Headers**: Properly configured CORS headers
- **Error Handling**: Graceful error responses
- **Request Validation**: Validates all incoming requests

### Additional Security (Optional):
- **API Key Authentication**: Require API key for requests
- **Origin Validation**: Restrict to specific origins
- **Rate Limiting**: Prevent abuse

## 📈 Monitoring & Analytics

### Built-in Analytics:
- **Request Count**: Track daily/monthly usage
- **Error Rates**: Monitor failed requests
- **Response Times**: Track performance
- **Geographic Distribution**: See where requests come from

### Access Analytics:
1. Go to **Workers & Pages** → **Your Worker**
2. Click **Metrics** tab
3. View real-time analytics

## 🔄 Usage in Plugin

### Update your plugin code:

```javascript
// Replace this:
const proxyUrl = 'https://corsproxy.io/';

// With this:
const proxyUrl = 'https://your-worker-name.your-subdomain.workers.dev/?url=';

// Usage example:
const imageUrl = 'https://randomuser.me/api/portraits/men/1.jpg';
const proxiedUrl = proxyUrl + encodeURIComponent(imageUrl);
```

## 🚨 Migration Steps

1. **Deploy Cloudflare Worker** (5 minutes)
2. **Test with a few requests** to ensure it works
3. **Update plugin configuration** to use your Worker URL
4. **Deploy updated plugin**
5. **Monitor usage** in Cloudflare dashboard

## 💡 Benefits Over Third-Party Services

### Reliability:
- **99.9% uptime** guaranteed by Cloudflare
- **Global edge network** for fast responses
- **No service shutdowns** like cors-anywhere

### Cost:
- **Free tier covers most use cases**
- **Predictable pricing** as you scale
- **No surprise bills** or service changes

### Control:
- **Full control** over your proxy
- **Custom domains** and branding
- **Advanced security** features
- **Detailed analytics**

### Performance:
- **Sub-50ms latency** globally
- **Automatic scaling** to handle traffic spikes
- **CDN-level performance**

## 🎯 Next Steps

1. **Deploy the Worker** using the instructions above
2. **Test it** with your current plugin
3. **Update your plugin** to use the new proxy
4. **Monitor usage** and upgrade if needed
5. **Consider custom domain** for branding

## 📞 Support

If you need help with deployment:
- **Cloudflare Docs**: [workers.cloudflare.com](https://workers.cloudflare.com)
- **Community Discord**: [discord.cloudflare.com](https://discord.cloudflare.com)
- **Stack Overflow**: Tag `cloudflare-workers` 