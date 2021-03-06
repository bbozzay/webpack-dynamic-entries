const path = require("path");
const devMode = process.env.NODE_ENV !== "production";
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { getDynamicEntries } = require("../src/index");

let options = {
    skipFilesWithPrefix: ["_", "-"],
		skipFilesInFolder: ["fonts"],
    trimAnyExtension: true,
		startingPath: "./assets"
}
console.log(getDynamicEntries(__dirname + "/assets", options));

module.exports = {
		entry: getDynamicEntries(__dirname + "/assets", options),
    //entry: {
        //bundle_css: ["./assets/scss/top_scss.scss", "./assets/scss/top_min_scss.min.scss"],
        //bundle_js: ["./assets/js/top_level.js"],
        //"./assets/test_bundle": ["./assets/js/top_level.js"]
    //},
    output: {
      path: path.resolve(__dirname, "dist"),
      //filename: "[name].min.js"
      // filename: "[name].min.js",
			filename: (singleEntry) => {
				return !singleEntry.chunk.name.includes("scss") ? '[name].js' : '[name]--delete--.js';
				//return "[name].js"
			}
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: devMode ? "[name].css" : "[name].[hash].css",
            //   filename: devMode ? '[name]' : '[name].[hash]',
            chunkFilename: devMode ? "[id].css" : "[id].[hash].css",
        }),
        new CleanWebpackPlugin(
          // paths to clean
          {
            dry: false,
            verbose: false,
            cleanOnceBeforeBuildPatterns: ['**/*'],
            cleanAfterEveryBuildPatterns: ['**/*--delete--*'],
          }
        )
    ],
    module: {
        rules: [
            {
                test: /\.js$/, //using regex to tell babel exactly what files to transcompile
                // exclude: /node_modules/, // files to be ignored
                exclude: {
                  test: [
                    /node_modules/
                  ]
                },
                use: {
                    loader: "babel-loader", // specify the loader
                },
            },
            {
                // Apply rule for .sass, .scss or .css files
                test: /\.(sa|sc|c)ss$/,

                // Set loaders to transform files.
                // Loaders are applying from right to left(!)
                // The first loader will be applied after others
                use: [
                    {
                        // After all CSS loaders we use plugin to do his work.
                        // It gets all transformed CSS and extracts it into separate
                        // single bundled file
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "./assets/scss"
                        }
                    },
                    {
                        // This loader resolves url() and @imports inside CSS
                        loader: "css-loader",
                    },
                    {
                        // First we transform SASS to standard CSS
                        loader: "sass-loader",
                        options: {
                            implementation: require("sass"),
                        },
                    },
                ],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                loader: 'file-loader',
                // use: [
                //     'file-loader',
                // ],
                options: {
                    name: devMode ? './fonts/[name]' : './fonts/[name].[hash]',
                }
            }
        ],
    },
};
