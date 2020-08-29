var assert = require("assert");
const { getDynamicEntries } = require("../src/index")

describe("Defaults", function () {
  // No Filters Applied
  let entries = getDynamicEntries(__dirname + "/assets");
  it("Outputs All Files", function() {
    // Files array shouldn't have directories
    assert(Object.keys(entries).length > 5)
  });
  it("Name and path validation", function() {

    for (let i in entries) {
      let name = i;
      let path = entries[i]
      let trimmedPrefix = (string) => string.substr(-(string.length-2));
      // Name should be a relative path
      assert(name[0] == ".")
      // file path and name should be included by default
      assert(trimmedPrefix(name).includes("."))
      assert(trimmedPrefix(path).includes("."))
      // path should start with an absolute reference by default
      assert(path[0] == "/")
    }

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
