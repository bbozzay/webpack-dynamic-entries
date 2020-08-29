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
1. Install the node module with `npm install --save-dev webpack-dynamic-entries`
2. Require the `getDynamicEntries()` function
3. Set the webpack `entry` key to the function with the absolute path to your source directory as the first argument.

```
const { getDynamicEntries } = require('webpack-dynamic-entries');
const dynamicEntriesObjects = {

}
...
module.exports = {
  entry: getDynamicEntries(__dirname + "/assets"),
  ...
}

```

## Options

### Skip Files
Avoid outputting certain files.

`skipFilesWithPrefix`: **array, default: ["_"]**
Files starting with any string in this array. For sass files, make sure to skip files starting with an underscore.

`skipFilesWithSuffix`: **array**
Files ending with any string in this array. Example: `options.skipFilesWithSuffix: [".woff"]`

`skipFilesInFolder`: **array**
Files in a folder defined in this array. Example: `options.skipFilesInFolder: ["fonts"]`

### Customized file names
Apply patterns to customize file output names.

`trimAnyExtension`: **boolean, default: true**
Removes any file extension from the `[name]`, like .min.js or .scss. This is useful if you add the required extension using the file-loader. Setting this to false risks outputting files with duplicate extensions (.js.js).

`trimExtensions`: **array**
Removes any user-defined file extensions from the `[name]`. Useful if some file loaders set the output file extension, but other file loaders do not.
Example: `options.trimExtensions: [".js"];`

## Example

### Source directory
```
assets
├── css
│   ├── -skip-prefix.min.css
│   └── style.css
├── fonts
│   ├── font-test.woff
│   └── font-test.woff2
├── js
│   ├── _ignore_file.js
│   ├── second_level
│   │   ├── _ignore_second_level_js.js
│   │   ├── second_level_js.js
│   │   ├── second_level_min_js.min.js
│   │   └── third_level
│   │       ├── _ignore_third_level_js.js
│   │       ├── third_level_js.js
│   │       └── third_level_min_js.min.js
│   ├── top-level-js.min.js
│   └── top_level.js
└── scss
    ├── second_level
    │   ├── _ignore_second_level_scss.scss
    │   ├── second_level_min_scss.min.scss
    │   ├── second_level_scss.scss
    │   └── third_level
    │       ├── _ignore_third_level.scss
    │       ├── third_level.scss
    │       └── third_level_min.min.scss
    ├── top_min_scss.min.scss
    └── top_scss.scss
```

### Output
The webpack output is set to the dist directory and several file loaders handle adding the correct file extensions.
Plugin options:
`skipFilesWithPrefix: ["_", "-"],`
`skipFilesInFolder: ["fonts"],`
`trimAnyExtension: true,`
`startingPath: "./assets"`

```
dist
└── assets
    ├── css
    │   ├── style.css
    │   └── style.js
    ├── js
    │   ├── second_level
    │   │   ├── second_level_js.js
    │   │   ├── second_level_min_js.js
    │   │   └── third_level
    │   │       ├── third_level_js.js
    │   │       └── third_level_min_js.js
    │   ├── top-level-js.js
    │   └── top_level.js
    └── scss
        ├── second_level
        │   ├── second_level_min_scss.css
        │   ├── second_level_scss.css
        │   └── third_level
        │       ├── third_level.css
        │       └── third_level_min.css
        ├── top_min_scss.css
        └── top_scss.css
```

### Webpack
In this example, several file loaders are used in combination with `getDynamicEntries`. The file loaders add the correct file extensions. `CleanWebpackPlugin` is used to remove webpack generated JS files that aren't needed (for CSS files). A function is used for `output.filename` to add an identifier to the JS version of the SCSS output files. This allows the `CleanWebpackPlugin` to find these files for cleanup after file loaders have finished. It also cleans the directory before compiling the files to avoid stale files.

```
// required files included up here.
...
const { getDynamicEntries } = require("webpack-dynamic-entries");
const options = {
    skipFilesWithPrefix: ["_", "-"],
    skipFilesWithSuffix: [".md"],
    skipFilesInFolder: ["fonts"],
    trimAnyExtension: true
}
module.exports = {
    entry: getDynamicEntries(__dirname + "/assets", options),
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: (singleEntry) => {
      // Rename JS files created for SCSS files with --delete-- so the webpack cleaner can remove those files
        return !singleEntry.chunk.name.includes("scss") ? '[name].js' : '[name]--delete--.js';
      }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: devMode ? "[name].css" : "[name].[hash].css",
            chunkFilename: devMode ? "[id].css" : "[id].[hash].css",
        }),
        new CleanWebpackPlugin(
          // Webpack generates JS files for everything, including CSS. This will delete those files.
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
                use: {
                    loader: "babel-loader", // specify the loader
                },
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "./assets/scss"
                        }
                    },
                    {
                        loader: "css-loader",
                    },
                    {
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
                options: {
                    name: devMode ? '[name]' : '[name].[hash]',
                }
            }
        ],
    },
};
```
