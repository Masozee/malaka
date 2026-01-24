/**
 * PM2 Ecosystem Configuration for Malaka ERP Frontend
 * Production-grade process management
 */

module.exports = {
  apps: [
    {
      name: 'malaka-frontend',
      script: 'pnpm',
      args: 'start',
      cwd: '/Users/pro/Dev/malaka/frontend',
      interpreter: 'none', // Run pnpm directly without node interpreter

      // Instance configuration
      instances: 1, // Single instance for now
      exec_mode: 'fork', // Fork mode for simpler setup

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_TELEMETRY_DISABLED: '1',
      },

      // Process management
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      min_uptime: '10s', // Minimum uptime before considered started
      max_restarts: 10, // Max restarts before stopping
      restart_delay: 4000, // Wait 4s before restart

      // Auto-restart configuration
      watch: false, // Disable watch in production
      autorestart: true,

      // Logging
      log_file: '/Users/pro/Dev/malaka/logs/frontend/combined.log',
      out_file: '/Users/pro/Dev/malaka/logs/frontend/out.log',
      error_file: '/Users/pro/Dev/malaka/logs/frontend/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Graceful shutdown
      kill_timeout: 5000, // Wait 5s for graceful shutdown
      // wait_ready: true, // Disabled - Next.js doesn't send ready signal
      // listen_timeout: 10000, // Wait 10s for listen event

      // Health monitoring
      exp_backoff_restart_delay: 100, // Exponential backoff on restart
    },
  ],

  // Deployment configuration (for remote servers)
  deploy: {
    production: {
      user: 'deploy',
      host: ['production-server'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/malaka.git',
      path: '/var/www/malaka',
      'pre-deploy-local': '',
      'post-deploy': 'cd frontend && pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
