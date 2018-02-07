const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const DtsGeneratorPlugin = require('dts-generator-webpack-plugin').default;
const path = require('path');

module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "index.js",
        path: __dirname + "/lib",
        library: "racecord",
        libraryTarget: "commonjs2"
    },

    devtool: "source-map",
    
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        plugins: [
            new TsconfigPathsPlugin({ configFile: path.join(__dirname, "tsconfig.json") })]
    },

    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    plugins: [
        new DtsGeneratorPlugin({name: "racecord", project: path.join(__dirname, "tsconfig.json")}),
        new UglifyJsPlugin()
    ]
};