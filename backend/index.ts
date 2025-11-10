const server = Bun.serve({
  port: 5050,
  async fetch(req) {
    const url = new URL(req.url);
    
    // Serve frontend static files in production
    if (process.env.NODE_ENV === 'production') {
      const frontendDist = '../frontend/dist';
      
      // Serve index.html for all non-API routes (SPA support)
      if (!url.pathname.startsWith('/api/')) {
        try {
          const filePath = url.pathname === '/' ? '/index.html' : url.pathname;
          const file = Bun.file(`${frontendDist}${filePath}`);
          
          if (await file.exists()) {
            const contentType = getContentType(filePath);
            return new Response(file, {
              headers: { 'Content-Type': contentType }
            });
          } else {
            // File not found, serve index.html for client-side routing
            const indexFile = Bun.file(`${frontendDist}/index.html`);
            if (await indexFile.exists()) {
              return new Response(indexFile, {
                headers: { 'Content-Type': 'text/html' }
              });
            }
          }
        } catch (error) {
          console.error('Error serving frontend file:', error);
        }
      }
    }

    // Health check endpoint
    if (url.pathname === "/") {
      return new Response(JSON.stringify({
        name: "LLM API Server",
        status: "running",
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({
        status: "ok",
        message: "Server is running",
        timestamp: Date.now()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

function getContentType(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'svg': return 'image/svg+xml';
    case 'ico': return 'image/x-icon';
    case 'woff': return 'font/woff';
    case 'woff2': return 'font/woff2';
    case 'ttf': return 'font/ttf';
    case 'eot': return 'application/vnd.ms-fontobject';
    default: return 'text/plain';
  }
}

console.log(`🚀 Server running on http://localhost:${server.port}`);
if (process.env.NODE_ENV === 'production') {
  console.log(`🌐 Serving frontend SPA from http://localhost:${server.port}`);
}