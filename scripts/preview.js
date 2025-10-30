#!/usr/bin/env node

/**
 * Starts a Vite preview server bound to the host/port required by Firebase App Hosting.
 * We use Vite's Node API so we can force the port exposed via the PORT env variable.
 */

const port = Number(process.env.PORT || 8080);

async function start() {
  try {
    const { preview } = await import('vite');

    const server = await preview({
      preview: {
        port,
        host: '0.0.0.0',
        strictPort: true,
      },
    });

    console.log(`[preview] listening on 0.0.0.0:${port}`);

    const close = async () => {
      console.log('[preview] shutting down');
      await server.close();
      process.exit(0);
    };

    process.on('SIGTERM', close);
    process.on('SIGINT', close);
  } catch (error) {
    console.error('[preview] failed to start');
    console.error(error);
    process.exit(1);
  }
}

start();
