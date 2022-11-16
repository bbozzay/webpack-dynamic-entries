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

    this.options = {
      //// SKIP FILES ////
      // files that start with...
      skipFilesWithPrefix: options && options.hasOwnProperty("skipFilesWithPrefix") ? options.skipFilesWithPrefix : ["_"],
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
      trimExtensions: options && options.hasOwnProperty("trimExtensions") ? options.trimExtensions : [],

			// Pathing
			startingPath: options && options.hasOwnProperty("startingPath") ? options.startingPath : "./assets"
    }
    this._allFilesAndFolders = fs.readdirSync(this.absolutePath);

    this._folders = {};
    this._files = {};

    this.validate();

  }
  validate() {
    let shouldBeArrays = ["skipFilesWithPrefix", "skipFilesWithSuffix", "skipFilesInFolder", "trimExtensions", "trimExtensions"]
    for (let i = 0; i < shouldBeArrays.length; i++) {
      let testValue = Array.isArray(this.options[shouldBeArrays[i]]);
      if (!testValue) {
        throw "option " + shouldBeArrays[i] + " should be an array of strings";
        return false
      }
    }
    let shouldBeBoolean = this.options.trimAnyExtension;
    if (typeof shouldBeBoolean != "boolean") {
      throw "option " + "trimAnyExtension" + " should be a boolean";
      return false
    }
    let shouldBeString = this.options.startingPath;
    if (typeof shouldBeString != "string") {
    	throw "options " + "startingPath" + " should be a string"
      return false
		}
    return this
  }

  get absolutePath() {
    let cleanPath = this._absolutePath;
    this._absolutePath[this._absolutePath.length-1] == "/" ? cleanPath = this._absolutePath : cleanPath = this._absolutePath + "/";
    return cleanPath
  }
	getRelativePath(targetPath) {
		let fileName = targetPath.replace(this.absolutePath, "");
		fileName = this.getFileName(fileName);
		return this.options.startingPath + "/" + fileName
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
    let nameWithRelativePath = this.getRelativePath(path);
    this._files[nameWithRelativePath] = path
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
    let shouldSkip = false;
    const loopThroughOptions = (optionArray, cb) => {
      if (!optionArray || optionArray.length == 0) {
        return
      }
      for (let i = 0; i < optionArray.length; i++) {
        let checkValue = optionArray[i];
        cb(checkValue)
      }
    }

      if (this.options.skipFilesWithPrefix) {
        loopThroughOptions(this.options.skipFilesWithPrefix, (compareName) => {
          if (fileOrFolder.substr(0, compareName.length) == compareName) {
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

  start() {
  	this.filterAll(this.absolutePath, this.targetFiles(this.absolutePath));
  	return this
  }

	// Read the directory and return the files
  targetFiles(dirPath) {
  	return dirPath ? fs.readdirSync(dirPath) : false;
  }

  getFileName(fileNameWithExtension) {
  	if (this.options.trimAnyExtension) {
			return fileNameWithExtension.replace(".min", "").replace(/\.[^/.]+$/, "")
		}
		if (this.options.trimExtensions && this.options.trimExtensions.length > 0) {
			let cleanFileName = fileNameWithExtension;
			      for (let i = 0; i < this.options.trimExtensions.length; i++) {
				let extension = this.options.trimExtensions[i];
				const replacebable = extension.includes('|')

				if(!replacebable) {
				  cleanFileName = cleanFileName.replace(extension, "")
				} else {
				  const extensionArray = extension.split("|")
				  cleanFileName = cleanFileName.replace(extensionArray[0], extensionArray[1])
				}
			      }
			return cleanFileName
		}
		return fileNameWithExtension
  }

  filterAll(dirPath, files) {
		let i = 0;

		while (files && i < files.length) {
			// Directory or file INCLUDING EXTENSION
			let fileOrFolderName = files[i];
			let thisPath = dirPath + fileOrFolderName;

			if (fs.statSync(thisPath).isDirectory()) {
				thisPath = createPathWithSlash(thisPath);
				this.addFolder(fileOrFolderName, thisPath, this.filterAll.bind(this));
			} else {
				this.addFile(fileOrFolderName, thisPath, this.filterAll.bind(this));
			}


			i++
		}

  	return this;
  }
  processFolder(folder) {

  }
}
  // Generate a list of files and directories based on the user provided absolute path and filters
const getDynamicEntries = (absolutePath, options) => {
  let entries = new DynamicEntries(absolutePath, options);
  entries.start();
  return entries.files;
}

module.exports = {
  DynamicEntries,
  getDynamicEntries
};
