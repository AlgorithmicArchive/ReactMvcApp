const path = require('path');

module.exports = {
  entry: './src/index.jsx', // Entry point for React
  output: {
    path: path.resolve(__dirname, 'wwwroot/js'), // Output directory
    filename: 'bundle.js', // Output bundled file
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Process .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Use Babel to transpile JSX and modern JavaScript
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'], // Resolve these extensions
  },
  mode: 'development',
};

