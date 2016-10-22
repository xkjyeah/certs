var webpack = require("webpack");
var path = require("path");
module.exports = {
	context: __dirname,
	devtool: 'sourcemap',
	entry: [
		'babel-polyfill',
		'./src/index.jsx',
		'./scss/style.scss'
	],
	output: {
		path: path.join(__dirname, "static"),
		filename: "index.js", // no hash in main.js because index.html is a static page
	},
	module: {
		loaders: [
			{
				test: /\.jsx$/,
				loader: "babel-loader",
				exclude: /node_modules/,
				query: {
					presets: ['es2015', 'stage-3'],
					plugins: ['transform-runtime', 'transform-react-jsx']
				}
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.scss$/,
				loader: 'style-loader!css-loader!sass-loader'
			},
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/,
				query: {
					presets: ['es2015', 'stage-3'],
					plugins: ['transform-runtime']
				}
			},
		],
	},
};
