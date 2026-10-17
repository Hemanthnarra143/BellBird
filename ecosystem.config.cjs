// ==============================================================================
// BellBird PM2 Ecosystem Configuration for Hostinger Node.js / VPS
// ==============================================================================
// Run with: pm2 start ecosystem.config.cjs
// Or configure in Hostinger hPanel -> Node.js selector

module.exports = {
  apps: [
    {
      name: 'bellbird',
      script: './server.ts',
      interpreter: 'node',
      interpreter_args: '--import tsx',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
