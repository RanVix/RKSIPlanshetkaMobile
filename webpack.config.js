const createExpoWebpackConfigAsync = require('@expo/webpack-config')

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv)

  config.module.rules.forEach(rule => {
    if (Array.isArray(rule.oneOf)) {
      rule.oneOf.forEach(oneOf => {
        if (oneOf.type === 'asset/resource') {
          oneOf.exclude = [...(oneOf.exclude || []), /\.svg$/]
        }
      })
    }
  })

  config.module.rules.push({
    test: /\.svg$/i,
    use: [
      {
        loader: require.resolve('react-native-svg-transformer/webpack'),
        options: {
          native: true,
        },
      },
    ],
  })

  return config
}

