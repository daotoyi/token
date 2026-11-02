module.exports = {
  apps: [
    {
      name: "dytoken-api",
      cwd: "/opt/dytoken-api",
      script: "server/index.js",
      instances: 1,
      exec_mode: "fork",
      uid: "www",
      gid: "www",
      autorestart: true,
      max_memory_restart: "350M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
