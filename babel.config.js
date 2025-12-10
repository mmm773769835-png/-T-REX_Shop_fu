module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // Ensure this line is present
    plugins: [
      // Remove "expo-router/babel" from here if it exists
      // The other plugin you installed, babel-plugin-module-resolver, should be here if needed
    ],
  };
};
