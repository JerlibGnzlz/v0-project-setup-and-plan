module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimated debe ser el último plugin
      // Temporalmente comentado hasta resolver compatibilidad con worklets
      // 'react-native-reanimated/plugin',
    ],
  }
}
