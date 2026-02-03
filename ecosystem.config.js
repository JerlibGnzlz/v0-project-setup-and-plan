// PM2 Ecosystem Configuration
// Para Digital Ocean: /var/www/amva-production/

const APP_DIR = process.env.PM2_APP_DIR || '/var/www/amva-production'

module.exports = {
  apps: [
    {
      name: 'amva-backend',
      script: './dist/src/main.js',
      cwd: `${APP_DIR}/backend`,
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 4000 },
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      max_restarts: 15,
      min_uptime: '10s',
      listen_timeout: 15000,
      kill_timeout: 5000,
    },
    {
      name: 'amva-frontend',
      script: 'npm',
      args: 'start',
      cwd: APP_DIR,
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production', PORT: 3000 },
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      max_restarts: 15,
      min_uptime: '10s',
      listen_timeout: 15000,
      kill_timeout: 5000,
    },
  ],
}
