import path from "path";
import  webpack, { Configuration } from "webpack";
import CopyWebpackPlugin from "copy-webpack-plugin";
import 'webpack-dev-server';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config: Configuration = {
  mode:
    (process.env.NODE_ENV as "production" | "development" | undefined) ??
    "development",
  entry: "./src/main.tsx",
  module: {
    rules: [
      {
        test: /.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              // 兼容 @import (reference) 语法
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(sass|css|scss)$/,
        use: ["style-loader", "css-loader",   {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              quietDeps: true, // 忽略 node_modules 里的警告
            },
          },
        }, "postcss-loader", ],
      },
      {
        test: /\.svg$/i,
        use:  ['@svgr/webpack'], // Webpack 5 内置方式
      },
    ],
  },
  devServer: {
    client: {
      overlay: {
        warnings: false,
        errors: true
      }
    },
    static: {
      directory: path.resolve(__dirname, "public"),
      publicPath: "/",
    },
    historyApiFallback: {
      index: "/index.html",
      disableDotRule: true,
    },
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    }
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
  },
  externals: {
   "react": "var window.React",
    "react-dom": "var window.ReactDOM",
    "prop-types": "var window.PropTypes",
    "@alifd/next": "var window.Next",
    "@alilc/lowcode-engine": "var window.AliLowCodeEngine",
    "@alilc/lowcode-engine-ext": "var window.AliLowCodeEngineExt",
    "moment": "var window.moment",
    "lodash": "var window._"
  },
  plugins: [
   
    new CopyWebpackPlugin({
      patterns: [{ from: "public" }],
    }),
    new webpack.DefinePlugin({
      VERSION_PLACEHOLDER: JSON.stringify('^1.3.4'), // 随便填一个版本号即可
    }),
    // new ProvidePlugin({
    //   React: 'react',
    //   ReactDOM: 'react-dom',
    // }),
  ],
};

export default config;
