var webpack = require("webpack");
var path = require("path");

module.exports = {
    context: __dirname,
    devtool: 'source-map',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    entry: [
        './src/index.jsx',
        './scss/style.scss'
    ],
    output: {
        path: path.join(__dirname, "static"),
        filename: "index.js", // no hash in main.js because index.html is a static page
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", 'sass-loader'],
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {},
        })
    ],
};
