const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api', // ✅ Solo captura rutas que empiezan con /api
    createProxyMiddleware({
      target: 'https://hector.medihomssys.com',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug'
     
    })
  );
};