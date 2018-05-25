var path = require('path');

module.exports = {
    // This is the "main" file which should include all other modules
    entry: './src/index.js',
    // Where should the compiled file go?
    output: {
      path: path.resolve(__dirname, './dist'),
      publicPath: '/dist/',
      filename: 'build.js'
    },
    module: {
      // Special compilation rules
      rules: [
        {
          // Ask webpack to check: If this file ends with .js, then apply some transforms
          test: /\.js$/,
          // Transform it with babel
          loader: 'babel-loader',
          // don't transform node_modules folder (which don't need to be compiled)
          exclude: /node_modules/
        }
    ]
  },
  devServer: {
    inline: false,
    port: 3000
  }
};