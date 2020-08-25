# Webpack Dynamic Entries
Creates dynamic entry points for JS, styles, and other assets for use with Webpack. Useful if you want to generate individual files for components and pages while still benefiting from pre and post-processing on those assets.

With [Webpack](https://webpack.js.org/guides/entry-advanced/), generating multiple files requires an entry object or array. 

## Introduction to the Webpack Entry Property
The entry property can be a string, array, or object. If a string or array of entry paths is used, one output file will be produced comprised of the paths defined in the entry array or string. If an object is used, bundled files will be produced for each entry property.

Example manually defined entry object:
```
module.exports = {
  ...
  entry: {
    bundle_css: ["./assets/scss/top_scss.scss", "./assets/scss/top_min_scss.min.scss"],
    bundle_js: ["./assets/js/top_level.js"],
    "./assets/test_bundle": ["./assets/js/top_level.js"],
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js
  }
  ...
```

Based on the entry points, the following files are created:
```
dist
├── assets
│   └── test_bundle.min.js
├── bundle_css.css
├── bundle_css.min.js
└── bundle_js.min.js
```

# Dynamic Entry Generation
Instead of manually defining the entry, you can use this plugin to dynamically generate this entry and customize the input and output. 

## Usage
Include the class directly for further customization.
1. Install the node module with `npm install --save-dev webpack-dynamic-entries`
2. Include the plugin in the webpack 
```
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
dynamicEntries = new DynamicEntries(__dirname + "/assets", "./assets", {

});
```

## API

#### Options


### Skip Files
Avoid outputting certain files.

`skipFilesWithPrefix`: **array, default: ["_"]**
Files starting with any string in this array.

`skipFilesWithSuffix`: **array**
Files ending with any string in this array. Example: `options.skipFilesWithSuffix: [".woff"]`

`skipFilesInFolder`: **array**
Files in a folder defined in this array. Example: `options.skipFilesInFolder: ["fonts"]`

### Customized file names
Apply patterns to customize file output names

`trimAnyExtension`: **boolean, default: true**
Removes any file extension from the `[name]`, like .min.js or .scss. This is useful if you add the required extension using the file-loader. Setting this to false risks outputting files with duplicate extensions (.js.js).

`trimExtension`: **array**
Removes any user-defined file extensions from the `[name]`. Useful if some file loaders set the output file extension, but other file loaders do not.
Example: A JS file loader sets a .min.js file extension, so JS file extensions should be trimmed initially. `options.trimExtension: [".js"];`

#### Methods

<strong>`getAllFiles`</strong>
Returns an array of 
<strong>`getAllFiles`</strong>
<strong>`getAllFiles`</strong>

## Sample Input/Output



### getAllFiles

## Sample Webpack

```

module.exports = {
    entry: wpEntries,
    output: {
      path: path.resolve(__dirname, "dist"),
      // filename: "[name].min.js",
      filename: (singleEntry) => {
        return !singleEntry.chunk.name.includes("scss") ? '[name].js' : '[name]--delete--.js';
        // return "[name].js"
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
                    name: devMode ? '[name]' : '[name].[hash]',
                }
            }
        ],
    },
};
```