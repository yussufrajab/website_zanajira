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
    // Directus (tume-cms) has been decommissioned — the Next.js app now
    // serves the admin UI and API directly (see /docs/DIRECTUS_TO_NEXTJS_API_MIGRATION_PLAN.md).
  ],
};