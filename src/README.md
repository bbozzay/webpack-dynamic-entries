# Webpack Dynamic Entries
Creates dynamic entry points for JS, styles, and other assets for use with Webpack. Useful if you want to generate individual files for components and pages while still benefiting from pre and post-processing on those assets.

With [Webpack](https://webpack.js.org/guides/entry-advanced/), generating multiple files requires an entry object or array. 

**Entry object**
Generate an object for named paths.
```
// { name: 'path'}
module.exports = {
  ...
  entry: {
    home: './home.js',
    about: './about.scss`,
    account: './account.js',
  },
  ...
```

**Entry Array**
```
// [ 'path' ]
module.exports = {
  ...
  entry: [ 
    './home.js',
    './about.scss`,
    './account.js',
  ],
  ...
```

Instead of manually defining the entry, you can use this plugin to dynamically generate this entry and customize the input.

## Example Input/Output
**Input**
```
scss/main.scss
scss/components/content/inner_ad.scss
scss/components/layout/footer.scss
scss/components/layout/footer/_style1.scss
scss/components/layout/footer/_style2.scss
scss/components/layout/header.scss
scss/pages/about.scss
scss/pages/home.scss
```

**Output**
```
// Assuming your output path resolves to the dist directory
// Assuming you ignore files starting with _
// Assuming you prefer to trim file extensions and replace with your CSS/JS loader's file extensions
/dist/scss/main
/dist/scss/components/content/inner_ad
/dist/scss/components/layout/footer
/dist/scss/components/layout/header
/dist/scss/pages/about
/dist/scss/pages/home
```

## Usage
Include the class directly for further customization. 
```
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
dynamicEntries = new DynamicEntries(__dirname + "/assets", "./assets", {
  ignorePrefix: "_",
  trimExtension: true,
  cleanExtensions: [".woff", ".woff2"]
});
```

## API

#### Options

`ignorePrefix`
`trimExtension`
`cleanExtension`

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