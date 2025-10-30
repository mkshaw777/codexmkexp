#!/usr/bin/env node

/**
 * Runs `vite preview` binding to the host/port expected by Firebase App Hosting.
 * Firebase provides the desired port through the PORT environment variable.
 */
const { spawn } = require('child_process');

const port = process.env.PORT || '8080';

const child = spawn(
  'npx',
  ['vite', 'preview', '--host', '0.0.0.0', '--port', port],
  { stdio: 'inherit', shell: true }
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

