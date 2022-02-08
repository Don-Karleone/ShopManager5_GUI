module.exports = {
    devServer: {
      proxy: {
        "^/api/": {
          target: "https://localhost:7112",
          pathRewrite: { "^/api/": "/api/" },
          changeOrigin: true,
          logLevel: "debug"
        }
      }
    }
  };