const path = require('path');
require('dotenv').config();

const { NODE_ENV, HOST, PORT } = process.env;
const mode = NODE_ENV === 'production' ? 'production' : 'development';

module.exports = {
  mode,
  entry: path.join(__dirname, 'src', 'index.js'),
  output: {
    path: path.join(__dirname, 'dist', 'assets'),
    publicPath: '/assets/',
  },
  devServer: {
    host: HOST || 'localhost',
    port: PORT || 5001,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
};
