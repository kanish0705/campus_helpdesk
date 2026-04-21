const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv'
};

const server = http.createServer((req, res) => {
  // Log request
  console.log(`${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);

  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // Prevent directory traversal
  filePath = path.normalize(filePath);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Check file exists
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log(`  ✗ Not Found: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        console.log(`  ✗ Error: ${err.code}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error', 'utf-8');
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      });
      res.end(content, 'utf-8');
      console.log(`  ✓ Sent: ${ext || 'file'}`);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`
╔════════════════════════════════════════════╗
║   Student Portal Server Running 🚀         ║
╠════════════════════════════════════════════╣
║   📍 Local:  http://localhost:${PORT}       ║
║   📍 IP:     http://127.0.0.1:${PORT}       ║
║                                            ║
║   Press Ctrl+C to stop                    ║
╚════════════════════════════════════════════╝
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.log('Try: netstat -ano | findstr :3000 (then kill process)');
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
