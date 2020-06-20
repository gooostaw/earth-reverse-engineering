const webpack = require('webpack')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const NodemonPlugin = require('nodemon-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env, { mode = 'production' }) => {
    return {
        context: path.resolve(__dirname, 'src-client'),
        entry: './main.ts',
        mode,
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.proto$/i,
                    use: 'raw-loader',
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.ts']
        },
        plugins: [
            new CleanWebpackPlugin({
                // cleanAfterEveryBuildPatterns: '',
                cleanAfterEveryBuildPatterns: ['!*.html'],
            }),
            new HtmlWebpackPlugin({
                template: './index.html',
                inject: "body"
            })
        ],
        devtool: 'inline-source-map',
        // watchOptions: {
        //     aggregateTimeout: 2000,
        //     poll: 2000
        // },
        output: {
            filename: mode === 'development' ? '[name].bundle.js' : '[name].[contenthash].bundle.js',
            chunkFilename: mode === 'development' ? '[name].chunk.js' : '[name].[contenthash].chunk.js',
            path: path.resolve(__dirname, './dist/public')
        },
    }
}