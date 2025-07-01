// Cloudflare Workers CORS Proxy for Figma Plugin
// Deploy this to Cloudflare Workers for production-ready CORS handling

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      // Parse the target URL from the request
      const url = new URL(request.url);
      const targetUrl = url.searchParams.get('url');
      
      if (!targetUrl) {
        return new Response('Missing target URL parameter', { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          }
        });
      }

      // Validate allowed domains for security
      const allowedDomains = [
        'api.dicebear.com',
        'randomuser.me',
        'i.pravatar.cc',
        'api.multiavatar.com',
        'robohash.org',
        'ui-avatars.com',
        'picsum.photos',
        'fastly.picsum.photos',
        'source.unsplash.com',
        'pixabay.com',
        'dummyjson.com',
        'fakestoreapi.com',
        'jsonplaceholder.typicode.com'
      ];

      const targetDomain = new URL(targetUrl).hostname;
      if (!allowedDomains.includes(targetDomain)) {
        return new Response(`Domain ${targetDomain} not allowed`, { 
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain',
          }
        });
      }

      // Forward the request to the target URL
      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: {
          ...Object.fromEntries(request.headers),
          // Remove problematic headers
          'Host': new URL(targetUrl).hostname,
          'Origin': new URL(targetUrl).origin,
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      // Make the request
      const response = await fetch(proxyRequest);
      
      // Create a new response with CORS headers
      const corsResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        },
      });

      return corsResponse;

    } catch (error) {
      return new Response(`Proxy error: ${error.message}`, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain',
        }
      });
    }
  },
}; 