module.exports = {
  apps: [
    {
      name: "tume-frontend",
      script: "npm",
      args: "start",
      cwd: "/home/nextjstest/tume_web/frontend",
      env: {
        NODE_ENV: "production",
        PORT: 3009,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      error_file: "/var/log/tume-web/frontend-error.log",
      out_file: "/var/log/tume-web/frontend-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
    {
      name: "tume-cms",
      script: "npx",
      args: "directus start",
      cwd: "/home/nextjstest/tume_web/cms",
      env: {
        NODE_ENV: "production",
        PORT: 8055,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      error_file: "/var/log/tume-web/cms-error.log",
      out_file: "/var/log/tume-web/cms-out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};