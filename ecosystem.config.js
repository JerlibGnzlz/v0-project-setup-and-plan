// PM2 Ecosystem Configuration
// Copiar este archivo al servidor en /var/www/amva-production/ o /var/www/amva-staging/

module.exports = {
  apps: [
    {
      name: 'amva-backend',
      script: './backend/dist/main.js',
      cwd: process.env.PM2_APP_DIR || './backend',
      instances: process.env.NODE_ENV === 'production' ? 2 : 1, // O 'max' para usar todos los CPUs
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: 4000,
      },
      error_file: './logs/amva-backend-error.log',
      out_file: './logs/amva-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: process.env.NODE_ENV === 'development',
      ignore_watch: ['node_modules', 'logs', 'dist'],
    },
    {
      name: 'amva-frontend',
      script: 'npm',
      args: 'start',
      cwd: process.env.PM2_APP_DIR || './frontend',
      instances: process.env.NODE_ENV === 'production' ? 2 : 1,
      exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: 3000,
      },
      error_file: './logs/amva-frontend-error.log',
      out_file: './logs/amva-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: process.env.NODE_ENV === 'development',
      ignore_watch: ['node_modules', 'logs', '.next'],
    },
  ],
}

