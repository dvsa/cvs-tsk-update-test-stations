const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const nodeExternals = require('webpack-node-externals');

const { NODE_ENV, SERVICE, AWS_PROVIDER_REGION, AWS_PROVIDER_STAGE } = process.env;

console.log(
  `\nBuilding Service:\n '${SERVICE}'\n mode: ${NODE_ENV}\n stage: '${AWS_PROVIDER_STAGE}'\n region: '${AWS_PROVIDER_REGION}'\n\n`,
);

module.exports = {
  context: path.resolve(__dirname, '..'),
  //TODO Reduce if multiple functions or multi bundle, outputs are required
  entry: path.resolve(__dirname, '..', 'src/index.ts'),
  target: 'node',
  devtool: 'source-map',
  stats: {
    colors: true,
    reasons: true,
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs',
    filename: 'handler.js',
    path: path.resolve(__dirname, '..', '.build'),
  },
  externals: [],
  plugins: [new CleanWebpackPlugin()],
};
