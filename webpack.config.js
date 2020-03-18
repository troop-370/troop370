
module.exports = {
  entry: './js/main(source).js',
  output: {
    filename: './js/main.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015'],
        },
      }
    ],
  },
};
