const fs = require("fs");
const path = require("path");

class DynamicEntries {
  constructor(sourceAbsolutePath, destinationRelativePath, options) {
    // this.dir = dir;
    this.absolutePath = sourceAbsolutePath;
    if (!this.absolutePath) {
      throw "Required path missing. First argument should be an absolute path to the source directory"
    }
    this.relativePath = destinationRelativePath;
    if (!this.relativePath) {
      throw "Required relative target path missing. Second argument should be a relative path to the target directory"
    }

    this.options = {
      trimPath: "assets",
      // remove an extension like .scss from the name
      trimAnyExtension: options && options.hasOwnProperty("trimAnyExtension") ? options.trimAnyExtension : false,
      trimExtensions: options && options.hasOwnProperty("trimExtensions") ? options.trimExtensions : false,
      // Ignore files that start with
      ignorePrefix: options && options.hasOwnProperty("ignorePrefix") ? options.ignorePrefix : false,
      // Ignore files that end with
      ignoreSuffix: options && options.hasOwnProperty("ignoreSuffix") ? options.ignoreSuffix : false,
      // Ignore files in a specific directory
      ignoreDirectory: options && options.hasOwnProperty("ignoreDirectory") ? options.ignoreDirectory : false,
    }

    // this.dir = absolutePath;
    this.arrayOfFiles = fs.readdirSync(this.absolutePath);
  }
  // get assetFolder() {
  //   let pathArray = this.absolutePath.split("/");
  //   pathArray = pathArray.filter(pathChunk => pathChunk !== '');
  //   return pathArray[pathArray.length-1];
  // }
  getAllFiles(dirPath = this.absolutePath, arrayOfFiles = this.arrayOfFiles) {
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
    // this.options.cleanExtensions ? cleanExtensions = [cleanExtensions, ...this.options.cleanExtensions] : false;
    if (this.options.trimAnyExtension) {
      let extension = path.parse(fileName).ext;
      fileName = fileName.replace(extension, "");
      fileName = fileName.replace(".min", "");
      // Look for two ending periods
      // fileName = path.parse(fileName).ext;
      // for (let i = 0; i< 2; i++) {
      //   fileName = filename.split('.').slice(0, -1).join('.');
      // }
    }
    if (this.options.trimExtensions) {
      for (let i = 0; i<this.options.trimExtensions.length; i++) {
        fileName = fileName.replace(this.options.trimExtensions[i], "");
      }
    }
    // if (this.options.trimExtension) {
    //   for (let i = 0; i < cleanExtensions.length; i++) {
    //     fileName = fileName.replace(cleanExtensions[i], "");
    //   }
    //   // return fileName.replace(".min", "").replace(".scss", "").replace(".js", "");
    //   return fileName
    // }
    return fileName
  }
  getFinalObject() {
    let arrayOfFinalFiles = this.getAllFiles();
    let finalObject = {};
    for (let i = 0; i < arrayOfFinalFiles.length; i++) {
      let name = this.cleanFileName(arrayOfFinalFiles[i]);
      if (!arrayOfFinalFiles[i].includes(this.options.ignoreDirectories)) {
        finalObject[name] = arrayOfFinalFiles[i];
        // finalObject[name] = arrayOfFinalFiles[i];
      }
    }
    return finalObject;
  }
}

const dynamicEntriesArray = (absolutePath, relativePath, options) => {
  let entries = new DynamicEntries(absolutePath, relativePath, options);
  return entries.getAllFiles();
}

const dynamicEntriesObject = (absolutePath, relativePath, options) => {
  let entries = new DynamicEntries(absolutePath, relativePath, options);
  return entries.getFinalObject();
}

module.exports = {
  DynamicEntries,
  dynamicEntriesArray,
  dynamicEntriesObject
};
