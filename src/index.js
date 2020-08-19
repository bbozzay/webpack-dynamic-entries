const fs = require("fs");
const path = require("path");

class DynamicEntries {
  constructor(absolutePath, relativePath, options) {
    // this.dir = dir;
    this.absolutePath = absolutePath;
    this.relativePath = relativePath;

    this.options = {
      trimPath: "assets",
      trimExtension: options && options.hasOwnProperty("trimExtension") ? options.trimExtension : false,
      ignorePrefix: options && options.hasOwnProperty("ignorePrefix") ? options.ignorePrefix : false
    }

    this.dir = absolutePath;
    this.arrayOfFiles = fs.readdirSync(this.dir);
  }
  get assetFolder() {
    let pathArray = this.absolutePath.split("/");
    pathArray = pathArray.filter(pathChunk => pathChunk !== '');
    return pathArray[pathArray.length-1];
  }
  getAllFiles(dirPath = this.dir, arrayOfFiles = this.arrayOfFiles) {
    let files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach((file) => {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        // Remove folders from the array of files
        arrayOfFiles.includes(file) ? (() => {
          let folderIndex = arrayOfFiles.indexOf(file);
          arrayOfFiles.splice(folderIndex, 1);
        })() : false;
        // Recursion
        arrayOfFiles = this.getAllFiles(dirPath + "/" + file, arrayOfFiles);
      } else {
        // Return the relative path and push that to the array instead of the absolute path
        // let relativePath = path.relative(__dirname, this.absolutePath) + dirPath.replace(this.absolutePath, "");
        let relativePath = dirPath.replace(this.absolutePath, "");
        file[0] != this.options.ignorePrefix ? (() => {
          let finalPath = this.relativePath + path.join(relativePath, "/", file)
          arrayOfFiles.push(finalPath);
        })(): false;
      }
    });

    return arrayOfFiles;
  }
  cleanFileName(fileName) {
    if (this.options.trimExtension) {
      return fileName.replace(".min", "").replace(".scss", "").replace(".js", "");
    }
    return fileName
  }
  getFinalObject() {
    let arrayOfFinalFiles = this.getAllFiles();
    let finalObject = {};
    for (let i = 0; i < arrayOfFinalFiles.length; i++) {
      let name = this.cleanFileName(arrayOfFinalFiles[i]);
      finalObject[name] = arrayOfFinalFiles[i];
    }
    return finalObject;
  }
}

module.exports = {
  DynamicEntries,
};
