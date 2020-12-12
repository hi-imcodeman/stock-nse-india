const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: process.env.NODE_ENV || 'development',
    entry: "./src/index.ts",
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, "/dist"),
        filename: "bundle.js",
        library: 'CalculationBundle',
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".json"]
    },
    plugins: [
        new CopyPlugin({
            patterns: [{
                from: 'public',
                to: '.'
            }, ],
        }),
    ],
    module: {
        rules: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            {
                test: /\.tsx?$/,
                use: ["ts-loader"],
                exclude: /node_modules/
            }
        ]
    }
}