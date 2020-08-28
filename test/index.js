var assert = require("assert");
const { getDynamicEntries } = require("../src/index")

describe("Defaults", function () {
  // No Filters Applied
  __dirname + "/assets/", {
	skipFilesWithPrefix: ["_"],
	skipFilesWithSuffix: [".scss"],
	//trimAnyExtension: true,
	trimExtensions: [".min.js"]
	//skipFilesInFolder: ["fonts"]
	//skipFilesInFolder: { "fonts": "test" }
  });
  it("Start", function () {
    // Directories array shouldn't have any files
    d_entries.start();
    console.log("Class", d_entries)
    //assert(d_entries.directories.length == 8)
  });
  it("Get Files", function() {
    // Files array shouldn't have directories
    // assert(d_entries.listAllFiles.length == 21)
  });
});

describe("Skip Files", function() {

  it("Skip Folder", function() {
    let options = {
      skipFilesInFolder: ["fonts"]
    }
    // let d_entries = new DynamicEntries(__dirname + "/assets/", options);
    // console.log("DIRS", d_entries.listAllDirectories);
    // let entries = dynamicEntriesObject(sourcePath, options);
      // console.log("ENTRIES", entries)
    // for (let i in entries) {
      // assert(entries[i].includes("."))
    // }
  });
  // it("Ignore only certain prefixes", function() {
  //   options.trimAnyExtension = false;
  //   options.trimExtensions = [".js", ".css"];
  //   let entries = dynamicEntriesObject(sourcePath, relativePath, options);
  //     // console.log("ENTRIES", entries)
  //   for (let i in entries) {
  //     assert(!i.includes(".css"))
  //     assert(!i.includes(".js"))
  //   }
  // });
  // it("Skip file based on prefix", function() {
  //   options.trimAnyExtension = true;
  //   options.trimExtensions = false;
  //   options.ignorePrefix = ["_", "-"];
  //   let entries = new DynamicEntries(sourcePath, relativePath, options);
  //   let allFiles = entries.getAllFiles();
  //   let filterFiles = entries.filterFiles();
  //   for (let i in allFiles) {
  //     console.log("II", allFiles[i])
  //     assert(!i.includes("_ignore"));
  //   }
  //   assert(entries.skipFileName("_Skip_file.css") == "_Skip_file.css");
  //   assert(entries.skipFileName("dont_skip-file.css") == false);
  // });
  // it("Skip Directories", function() {
  //   options.trimAnyExtension = true;
  //   options.trimExtensions = false;
  //   // options.ignorePrefix = false;
  //   options.skipDirectories = ["fonts"];
  //   let entries = new DynamicEntries(sourcePath, relativePath, options);
  //   let allFiles = entries.getAllFiles();
  //   for (let i in allFiles) {
  //     console.log("EE", allFiles[i])
  //     assert(!allFiles[i].includes("fonts"));
  //   }
  //   // assert(entries.skipFile("_Skip_file.css") == "_Skip_file.css");
  //   // assert(entries.skipFile("dont_skip-file.css") == false);
  // });
});
