const fs = require("fs");
const path = require("path");

// Check if a path has a trailing slash. If not, add one.
function createPathWithSlash(path) {
  path[path.length-1] != "/" ? path = path + "/" : path;
  return path;
}


class DynamicEntries {
  constructor(sourceAbsolutePath, options) {
    // Absolute reference to the entry files
    // E.g __dirname + "/assets/"
    this._absolutePath = sourceAbsolutePath;
    if (!this.absolutePath) {
      throw "Required path missing. First argument should be an absolute path to the source directory"
    }
    //this.relativePath = destinationRelativePath;
    // if (!this.relativePath) {
    //   throw "Required relative target path missing. Second argument should be a relative path to the target directory"
    // }

    this.options = {
      //// SKIP FILES ////
      // files that start with...
      skipFilesWithPrefix: options && options.hasOwnProperty("skipFilesWithPrefix") ? options.skipFilesWithPrefix : [],
      // files that end with...
      skipFilesWithSuffix: options && options.hasOwnProperty("skipFilesWithSuffix") ? options.skipFilesWithSuffix : [],
      // Ignore files in a specific directory
      skipFilesInFolder: options && options.hasOwnProperty("skipFilesInFolder") ? options.skipFilesInFolder : [],

      //// CUSTOMIZE FILE NAMES ////
      // remove an extension like .scss from the file path
      // use this if you want to use a file loader to define the extension
      // removes .min, .min.js, .min.scss, .scss etc.
      trimAnyExtension: options && options.hasOwnProperty("trimAnyExtension") ? options.trimAnyExtension : false,
      // Array of extensions to remove. Trims a string from the end of the file name. Example, ['.js', '.min.js']
      trimExtensions: options && options.hasOwnProperty("trimExtensions") ? options.trimExtensions : false,

    }
    this._allFilesAndFolders = fs.readdirSync(this.absolutePath);

    this._folders = {};
    this._files = {};
    this._filesAndFolders = [];

    // Object with key: Array
    this._results = {};

    // Starting Array of All Files
    this.init(this.absolutePath, this._allFilesAndFolders);
  }

  get absolutePath() {
    let cleanPath = this._absolutePath;
    this._absolutePath[this._absolutePath.length-1] == "/" ? cleanPath = this._absolutePath : cleanPath = this._absolutePath + "/";
    return cleanPath
  }

  // List all directories, even excluded ones
  get folders() {
    return this._folders;
  }
  addFolder(folderName, path, cb) {
  // is folder a name or path?
    if (this.shouldSkip(folderName)) {
      return
    }
    this._folders[folderName] = path
    cb(path, this.targetFiles(path))
  }

  // List all files, even the excluded ones
  get files() {
    return this._files;
  }
  // Add a file to the files array
  addFile(fileName, path, cb) {
    if (this.shouldSkip(fileName)) {
      return
    }
    this._files[fileName] = path
    cb(path, null)
  }

  get filesAndFolders() {
      return this._filesAndFolders;
  }
  set filesAndFolders(path) {
      return this._filesAndFolders.push(path)
  }
  shouldSkip(fileOrFolder) {
    // helper
    //console.log("SHOULD ___ SKIP", fileOrFolder)
    let shouldSkip = false;
    const loopThroughOptions = (optionArray, cb) => {
      if (!optionArray || optionArray.length == 0) {
        //return
      }
      for (let i = 0; i < optionArray.length; i++) {
        let checkValue = optionArray[i];
        cb(checkValue)
      }
    }

      if (this.options.skipFilesWithPrefix) {
        loopThroughOptions(this.options.skipFilesWithPrefix, (compareName) => {
          if (fileOrFolder.substr(0, compareName.length) == compareName) {
            //console.log("SKIP", fileOrFolder, compareName)
            shouldSkip = true;
          }
        })
      }
      if (this.options.skipFilesWithSuffix) {
          loopThroughOptions(this.options.skipFilesWithSuffix, (compareName) => {
          if (fileOrFolder.substr(-compareName.length) == compareName) {
            shouldSkip = true;
          }
        })
      }
      if (this.options.skipFilesInFolder) {
          loopThroughOptions(this.options.skipFilesInFolder, (compareName) => {
          if (fileOrFolder == compareName) {
            shouldSkip = true;
          }
        })
      }
    return shouldSkip;
  }


  // TODO:
  // Simplify this to one function that generates the files based on skips, renames, etc.
  // Bundle files that match specific rules, like files in sub folders within a folder
  // Need to solve grouping files/folders
  // Just focus on creating that final object
  start() {
  	this.filterAll(this.absolutePath, this.targetFiles(this.absolutePath));
  	return this
  }

	// Read the directory and return the files
  targetFiles(dirPath) {
  	return dirPath ? fs.readdirSync(dirPath) : false;
  }

  getFileName(fileNameWithExtension) {
    return fileNameWithExtension.replace(".min", "").replace(/\.[^/.]+$/, "")
  }

  filterAll(dirPath, files) {
  	console.log("FilterAll", dirPath)
		let i = 0;

		while (files && i < files.length) {
			// Directory or file INCLUDING EXTENSION
			let fileOrFolderName = files[i];
			let thisPath = dirPath + fileOrFolderName;

			//console.log("ForF", fileOrFolderName)

			if (fs.statSync(thisPath).isDirectory()) {
				thisPath = createPathWithSlash(thisPath);
				this.addFolder(fileOrFolderName, thisPath, this.filterAll.bind(this));
			} else {
				//console.log("NN", dirPath, "name", fileOrFolderName)
				this.addFile(fileOrFolderName, thisPath, this.filterAll.bind(this));
			}


			i++
		}

  	return this;
  }
  processFolder(folder) {

  }
  // Generate a list of files and directories based on the user provided absolute path and filters
  init(dirPath = this.absolutePath, arrayOfFiles = this._allFilesAndFolders, currentDirectory = null) {
    let files = fs.readdirSync(dirPath);
    // console.log("START INIT", dirPath, arrayOfFiles)
    arrayOfFiles = arrayOfFiles || [];
    let count = 0;

    // Loop through every intial file and folder
    while (count < files.length) {
      let fileName = files[count];
      let thisPath = dirPath + fileName;
      //console.log("FF", fileName)
      // console.log("thisPath", thisPath)
      // console.log(file, fs.statSync(dirPath + "/" + file).isDirectory())
      count++;

      let isSkipped = false;

      // Decide to skip or read this file/directory
      // this.skip(thisPath, fileName, currentDirectory);
      if (fs.statSync(thisPath).isDirectory()) {
        thisPath = createPathWithSlash(dirPath + fileName)
        arrayOfFiles = this.init(thisPath, arrayOfFiles, fileName);
      } else {
        arrayOfFiles.push(thisPath);
      }
        // Return the relative path and push that to the array instead of the absolute path
        // let relativePath = path.relative(__dirname, this.absolutePath) + dirPath.replace(this.absolutePath, "");
        // let finalPath = this.relativePath + path.join(relativePath, "/", file)
        // this.arrayOfFiles.push(finalPath);
    }
    return arrayOfFiles
  }

  skip(thisPath, fileName, currentDirectory) {
    const loopThroughOptions = (optionArray, cb) => {
      for (let i = 0; i < optionArray.length; i++) {
        let checkValue = optionArray[i];
        cb(checkValue)
      }
    }

    // Handle directories
    if (fs.statSync(thisPath).isDirectory()) {
    // console.log(fileName)
      // Cleanup the path
      thisPath = createPathWithSlash(thisPath);
      // Check if this folder should be skipped.
      this.options.skipFilesInFolder.length > 0 ? loopThroughOptions(this.options.skipFilesInFolder, (checkValue) => {
        // console.log("skip selected folder", checkValue, "check fileName", fileName)
        if (fileName != checkValue) {
          // If it shouldn't be skipped, run the function again with the sub folders
          this.createDirectory(currentDirectory, fileName)
          // Callback
          let subFolderFiles = fs.readdirSync(thisPath)
          this.init(thisPath, subFolderFiles, fileName)
        }
      }) : this.createDirectory(currentDirectory, fileName);
    } else {
    }
    // if (this.options.skipFilesWithPrefix) {
    //   loopThroughOptions(this.options.ignorePrefix, (checkValue) => {
    //     if (fileName.substr(0, checkValue.length) == checkValue) {
    //       this.files = fileName;
    //       return fileName
    //     }
    //   });
    // }
    // if (this.options.skipFilesWithSuffix) {
    //   loopThroughOptions(this.options.ignoreSuffix, (checkValue) => {
    //     if (fileName.substr(fileName.length, -checkValue.length) == checkValue) {
    //       this.files = fileName;
    //       return fileName
    //     }
    //   });
    // }
    // return false;
  }
  // skipDirectory(directory) {
  //   if (this.options.skipDirectories) {
  //       let skip = this.options.skipDirectories.filter(dir => {
  //         let dirPath = dir;
  //         return directory.includes(dirPath);
  //       })
  //     if (skip && skip.hasOwnProperty("length") && skip.length > 0) {
  //       return directory
  //     }
  //   }
  //   return false;
  // }
  // removeFromArrayOfFiles(file) {
  //   // console.log("REMOVE FILE", file)
  //   // console.log("array of FILE", this.arrayOfFiles, file)
  //   let folderIndex = this.arrayOfFiles.indexOf(file);
  //   this.arrayOfFiles.splice(folderIndex, 1);
  // }

  // get relativeDirectory() {
  //   let dirPath = this.absolutePath;
  //   return dirPath.replace(this.absolutePath, "")
  // }


  // // Refine files based on user options
  // filterFiles() {
  //   console.log("FILTER THIS", this.arrayOfFiles)
  //   if (this.skipDirectory(this.relativeDirectory)) {
  //   // console.log("FF", "rpath", relativePath, "file", file, "array of files", this.arrayOfFiles)
  //     // this.removeFromArrayOfFiles(this.relativeDirectory)
  //     // continue
  //   }
  //   let filteredFiles = this.arrayOfFiles.filter(file => {
  //     let fileName = file.replace(this.relativePath + "/", "");
  //     console.log("FILTERING", fileName)
  //     let skipFile = false;
  //     if (this.skipFileName(fileName)) {
  //       // this.removeFromArrayOfFiles(file)
  //       // continue
  //     }
  //   })
  //   return this.arrayOfFiles;
  // }
  // cleanFileName(fileName) {
  //   // this.options.cleanExtensions ? cleanExtensions = [cleanExtensions, ...this.options.cleanExtensions] : false;
  //   if (this.options.trimAnyExtension) {
  //     let extension = path.parse(fileName).ext;
  //     fileName = fileName.replace(extension, "");
  //     fileName = fileName.replace(".min", "");
  //     // Look for two ending periods
  //     // fileName = path.parse(fileName).ext;
  //     // for (let i = 0; i< 2; i++) {
  //     //   fileName = filename.split('.').slice(0, -1).join('.');
  //     // }
  //   }
  //   if (this.options.trimExtensions) {
  //     for (let i = 0; i<this.options.trimExtensions.length; i++) {
  //       fileName = fileName.replace(this.options.trimExtensions[i], "");
  //     }
  //   }
  //   return fileName
  // }
  // getFinalObject() {
  //   let arrayOfFinalFiles = this.getAllFiles();
  //   let finalObject = {};
  //   for (let i = 0; i < arrayOfFinalFiles.length; i++) {
  //     let name = this.cleanFileName(arrayOfFinalFiles[i]);
  //     if (!arrayOfFinalFiles[i].includes(this.options.ignoreDirectories)) {
  //       finalObject[name] = arrayOfFinalFiles[i];
  //       // finalObject[name] = arrayOfFinalFiles[i];
  //     }
  //   }
  //   return finalObject;
  // }
  createDirectory(currentDirectory = null, newFolder) {
    // this.listAllDirectories.push(newFolder)
    // console.log("PUSH", this, this.directories, newFolder)
    this.directories = newFolder;
    // this._directories.push(newFolder);
    // TBD: Return a nested object
    // Check if currentDirectory is set so we know to look for a folder in the object
    // If set, check each object key for a match OR if the key contains an object
    // If the key contains an object, check each key in that nested object until a match is found

    // !currentDirectory ? this.listDirectories.push(newFolder) : (() => {
      // Find the existing directory, then nest the new folder under it
      // for (let folderKey in this.listDirectories) {
      //   console.log("i", folderKey)
      //   if (folderKey == currentDirectory) {
      //     console.log("MATCH", folderKey)
      //     this.listDirectoriesfolderKey[newFolder] = {}

      //   }
      // }
    // })();
    // Check if has a parent

  }
}

const dynamicEntriesArray = (absolutePath, relativePath, options) => {
  let entries = new DynamicEntries(absolutePath, relativePath, options);
  return entries.filterFiles()
  // return entries.getAllFiles();
}

const dynamicEntriesObject = (absolutePath, relativePath, options) => {
  let entries = new DynamicEntries(absolutePath, relativePath, options);
  // return entries.getFinalObject();
}

module.exports = {
  DynamicEntries,
  dynamicEntriesArray,
  dynamicEntriesObject
};
