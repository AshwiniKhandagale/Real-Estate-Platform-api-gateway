const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Rate Limiter Configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
});

app.use(limiter);

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes for Microservices
app.use(
  '/users',
  createProxyMiddleware({ 
    target: process.env.USER_SERVICE_URL, 
    changeOrigin: true 
  })
);

app.use(
  '/agents',
  createProxyMiddleware({ 
    target: process.env.AGENT_SERVICE_URL, 
    changeOrigin: true 
  })
);

app.use(
  '/properties',
  createProxyMiddleware({ 
    target: process.env.PROPERTY_SERVICE_URL, 
    changeOrigin: true 
  })
);
app.use(
  '/admin',
  createProxyMiddleware({ 
    target: process.env.ADMIN_SERVICE_URL, 
    changeOrigin: true 
  })
);
// Fallback for Unknown Routes
app.use((req, res) => {
  console.log(`Proxying Request: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'API Gateway: Route not found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start the API Gateway
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
});
