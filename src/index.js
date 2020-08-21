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
      skipDirectories: options && options.hasOwnProperty("skipDirectories") ? options.skipDirectories : false,
    }

    // this.dir = absolutePath;
    this.arrayOfFiles = fs.readdirSync(this.absolutePath);
  }
  skipFileName(fileName) {
    function loopThroughOptions(optionArray, cb) {
      for (let i = 0; i < optionArray.length; i++) {
        let checkValue = optionArray[i];
        cb(checkValue)
      }
    }
    if (this.options.ignorePrefix) {
      loopThroughOptions(this.options.ignorePrefix, (checkValue) => {
        if (fileName.substr(0, checkValue.length) == checkValue) {
          return fileName
        }
      });
    }
    if (this.options.ignoreSuffix) {
      loopThroughOptions(this.options.ignoreSuffix, (checkValue) => {
        if (fileName.substr(fileName.length, -checkValue.length) == checkValue) {
          return fileName
        }
      });
    }
    return false;
  }
  skipDirectory(directory) {
    if (this.options.skipDirectories) {
        let skip = this.options.skipDirectories.filter(dir => {
          let dirPath = dir;
          return directory.includes(dirPath);
        })
      if (skip && skip.hasOwnProperty("length") && skip.length > 0) {
        return directory
      }
    }
    return false;
  }
  removeFromArrayOfFiles(file) {
    // console.log("REMOVE FILE", file)
    // console.log("array of FILE", this.arrayOfFiles, file)
    let folderIndex = this.arrayOfFiles.indexOf(file);
    this.arrayOfFiles.splice(folderIndex, 1);
  }

  get relativeDirectory() {
    let dirPath = this.absolutePath;
    return dirPath.replace(this.absolutePath, "")
  }
 
  // Just return files, not folders
  getAllFiles(dirPath = this.absolutePath, arrayOfFiles = this.arrayOfFiles) {
    let files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    let count = 0;

    while (count < files.length) {
      let file = files[count];
      let relativePath = this.relativeDirectory;
      // console.log(file, fs.statSync(dirPath + "/" + file).isDirectory())
      count++;

      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        // Remove directories from the array of files
        this.arrayOfFiles.includes(file) ? (() => {
          this.removeFromArrayOfFiles(file);
        })() : false;
        // Recursion
        this.arrayOfFiles = this.getAllFiles(dirPath + "/" + file, this.arrayOfFiles);
      } else {
        // Return the relative path and push that to the array instead of the absolute path
        // let relativePath = path.relative(__dirname, this.absolutePath) + dirPath.replace(this.absolutePath, "");
        let finalPath = this.relativePath + path.join(relativePath, "/", file)
        this.arrayOfFiles.push(finalPath);
      }
    }

    return this.arrayOfFiles;
  }

  // Refine files based on user options
  filterFiles() {
    console.log("FILTER THIS", this.arrayOfFiles)
    if (this.skipDirectory(this.relativeDirectory)) {
    // console.log("FF", "rpath", relativePath, "file", file, "array of files", this.arrayOfFiles)
      // this.removeFromArrayOfFiles(this.relativeDirectory)
      // continue
    }
    let filteredFiles = this.arrayOfFiles.filter(file => {
      let fileName = file.replace(this.relativePath + "/", "");
      console.log("FILTERING", fileName)
      let skipFile = false;
      if (this.skipFileName(fileName)) {
        // this.removeFromArrayOfFiles(file)
        // continue
      }
    })
    return this.arrayOfFiles;
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
