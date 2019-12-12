const path = require('path');

module.exports = {

  entry: './src/js/index.js',

  // Webpack will bundle all JavaScript into this file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  // The default mode for webpack is production.
  // Depending on the mode, webpack will apply different things
  // on the final bundle. For now we don't need production's JavaScript
  // minifying and other things, so we will set mode to development
  mode: 'development',

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ["@babel/plugin-transform-runtime",
                {
                  "regenerator": true
                }
              ]
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader', 'css-loader',
        ],
      },
    ],
  },
};