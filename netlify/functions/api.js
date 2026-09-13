const serverless = require('serverless-http');
const app = require('../../server');

// Wrap the full Express app for Netlify Functions deployment
module.exports.handler = serverless(app);
