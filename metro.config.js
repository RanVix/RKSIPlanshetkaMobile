const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

  config.server = {
    ...config.server,
    proxy: {
      "/api": {
        target: "https://planshetka.yarovich.ru/api/v2",
        changeOrigin: true,
        pathRewrite: { "^/api": "" },
      },
    },
  };

  return config;
})();
