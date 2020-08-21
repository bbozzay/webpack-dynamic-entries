var assert = require("assert");
const { DynamicEntries, dynamicEntriesArray, dynamicEntriesObject } = require("../src/index")

describe("Defaults", function () {
  it("Generate Array (no options)", function () {
    let entries = dynamicEntriesArray(__dirname + "/assets/", "./assets1")
    // Check array is populated
    assert(entries.length > 3)
    assert(Array.isArray(entries))
    // Check if it's a string with a longer length, like a file path
    assert(entries[0].length > 18)
    // Check if suffix is not stripped
    assert(entries[0].includes("."))
  });
  it("Generate Object (no options)", function () {
    let entries = dynamicEntriesObject(__dirname + "/assets/", "./assets1")
    assert(typeof entries == "object")
    // Shouldn't be an array
    assert(!entries[0])
    // Check if is a longer string
    assert(entries[Object.keys(entries)[0]].length > 18)
    // Check if suffix is not stripped
    assert(entries[Object.keys(entries)[0]].includes("."))
    // assert(entries[0].length > 18)
  });
});

describe("Options Set", function() {
  let sourcePath = __dirname + "/assets";
  let relativePath = "./assets";
  let options = {
    // Trim any exension from the name
    trimAnyExtension: true
  }
  it("Ignore prefix", function() {
    let entries = dynamicEntriesObject(sourcePath, relativePath, options);
      // console.log("ENTRIES", entries)
    for (let i in entries) {
      assert(!i.includes(".min"))
      assert(!i.includes(".scss"))
      assert(!i.includes(".js"))
      assert(entries[i].includes("."))
    }
  });
  it("Ignore only certain prefixes", function() {
    options.trimAnyExtension = false;
    options.trimExtensions = [".js", ".css"];
    let entries = dynamicEntriesObject(sourcePath, relativePath, options);
      // console.log("ENTRIES", entries)
    for (let i in entries) {
      assert(!i.includes(".css"))
      assert(!i.includes(".js"))
    }
  });
});