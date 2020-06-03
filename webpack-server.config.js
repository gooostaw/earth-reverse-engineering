const webpack = require('webpack')
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const NodemonPlugin = require('nodemon-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

module.exports = (env, { mode = 'production' }) => {

    const plugins = []

    if (mode === 'production')
        plugins.push(new CleanWebpackPlugin())

    if (mode === 'development')
        plugins.push(new NodemonPlugin({
            nodeArgs: ['--inspect=1337'],
            protocol: "inspector",
            args: ['--debug'],
            watch: [path.resolve('./dist')],
            script: './dist/main.js',
            ext: 'js'
        }))

    // if (part === 'demo')
    //     plugins.push(new CopyPlugin({
    //         patterns: [
    //             { from: './src/demo/files' },
    //         ],
    //     }))

    return {
        entry: './src-server/main.ts',
        target: 'node',
        mode,
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.ts']
        },
        plugins,
        devtool: mode === 'development' ? 'inline-source-map' : false,
        output: { path: path.resolve(__dirname, './dist'), },
        node: {
            __dirname: false,
            __filename: false
        }
    }
}