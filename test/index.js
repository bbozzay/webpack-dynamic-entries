var assert = require("assert");
const { DynamicEntries } = require("../src/index")

describe("m", function () {
  describe("l", function () {
    it("k", function () {
      let options = {
        ignorePrefix: "_"
      }
      let entries = new DynamicEntries(__dirname + "/assets/", "./assets", options);
      console.log(entries.getAllFiles())
      console.log("final Object", entries.getFinalObject())
      // console.log(entries.assetFolder)
      // assert(entries.name == "test");
    });
  });
});