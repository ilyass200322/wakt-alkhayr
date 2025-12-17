module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src_app/components',
            '@screens': './src_app/screens',
            '@store': './src_app/store',
            '@services': './src_app/services',
            '@types': './src_app/types',
            '@utils': './src_app/utils',
            '@navigation': './src_app/navigation'
          }
        }
      ]
    ]
  };
};
