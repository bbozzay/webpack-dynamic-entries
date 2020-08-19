var assert = require("assert");
const { DynamicEntries } = require("../src/index")

describe("m", function () {
  describe("l", function () {
    it("k", function () {
      let entries = new DynamicEntries(__dirname + "/assets/", "./assets");
      console.log(entries.getAllFiles())
      // console.log(entries.assetFolder)
      // assert(entries.name == "test");
    });
  });
});