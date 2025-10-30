#!/usr/bin/env node

/**
 * Simple Express server to serve the production build for Firebase App Hosting.
 * Serves static assets from /build and falls back to index.html for SPA routes.
 */

const path = require('path');
const express = require('express');

const app = express();
const port = Number(process.env.PORT || 8080);
const buildDir = path.resolve(__dirname, '..', 'build');

app.use(express.static(buildDir, { maxAge: '1y', index: false }));

app.get('*', (_req, res) => {
  res.sendFile(path.join(buildDir, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[server] listening on http://0.0.0.0:${port}`);
});
