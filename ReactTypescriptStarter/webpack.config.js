const path = require('path');
const devMode = process.env.NODE_ENV !== 'production';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: {
        app: './src/main.tsx'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                include: path.resolve(__dirname, "src"),
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(), //This empties the dist folder
        new HtmlWebpackPlugin({
            chunks: ['app'],
            inject: false, //We generate the tags manually with lodash templating
            template: path.resolve(__dirname, 'Views/Default/Index_template.cshtml'), //This is our template
            filename: path.resolve(__dirname, 'Views/Default/Index.cshtml') //This is our actual Index.cshtml file
        })
    ],
    output: {
        filename: devMode ? '[name].bundle.[hash].js' : '[name].bundle.[chunkhash].js',
        path: path.resolve(__dirname, 'wwwroot/dist'), //This is where our bundles are going to go
        publicPath: '/dist/'
    }
};