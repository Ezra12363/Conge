const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        // Handle CSRF token for Sanctum
        if (req.headers['x-xsrf-token']) {
          proxyReq.setHeader('X-XSRF-TOKEN', req.headers['x-xsrf-token']);
        }
      },
      onProxyRes: (proxyRes, req, res) => {
        // Handle CORS headers
        proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-XSRF-TOKEN, X-Requested-With';
      }
    })
  );

  // Handle Sanctum CSRF cookie endpoint
  app.use(
    '/sanctum/csrf-cookie',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
      secure: false,
    })
  );
};
