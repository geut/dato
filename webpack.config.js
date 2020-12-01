const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

const { HotModuleReplacementPlugin } = require('webpack')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const dnssd = require('dnssd')
const nodeExternals = require('webpack-node-externals')

const isDevelopment = process.env.NODE_ENV !== 'production'
const publicPort = 1212
const publicPath = isDevelopment ? './' : `http://localhost:${publicPort}/dist`

module.exports = {
  mode: isDevelopment ? 'development' : 'production',

  module: {
    // Solve warning in sodium using require('cryp'+'to') for reasons.
    rules: [
      // js
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },

      {
        test: /\.svg$/,
        exclude: /node_modules/,
        use: {
          loader: '@svgr/webpack',
          options: {},
        },
      },

      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },

      // fonts
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },

  output: {
    path: `${__dirname}/build`,
    publicPath,
    filename: 'bundle.js',
  },

  plugins: [
    new HotModuleReplacementPlugin(),
    new HtmlWebPackPlugin({
      inject: true,
      template: `${__dirname}/static/index.html`,
    }),
  ],

  externals: [
    nodeExternals({
      allowlist: [/^@babel/],
    }),
  ],

  entry: `${__dirname}/app/index.js`,

  target: 'electron-renderer',

  resolve: {
    aliasFields: [],
  },

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    // hot: true,
    // compress: true,
    // disableHostCheck: true,
    port: publicPort,
    publicPath: '/dist/',
    noInfo: true,
    contentBase: path.join(__dirname, 'static'),
    clientLogLevel: 'debug',
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },

    before() {
      console.log('Starting Main Process...')
      spawn('npm', ['run', 'start:main'], {
        shell: true,
        env: process.env,
        stdio: 'inherit',
      })
        .on('close', (code) => process.exit(code))
        .on('error', (err) => console.error(err))
    },
  },
}
