"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _ = _interopRequireWildcard(require("../"));

test("imports working", function () {
  expect((0, _typeof2["default"])(_["default"])).toBe("function");
  expect((0, _typeof2["default"])(_.configureFbsql)).toBe("function");
  expect((0, _typeof2["default"])((0, _.getConfig)())).toBe("object");
});
test("configure working", function () {
  (0, _.configureFbsql)({
    isFirestore: true,
    shouldCommitResults: true,
    shouldExpandResults: false
  });

  var _getConfig = (0, _.getConfig)(),
      isFirestore = _getConfig.isFirestore,
      shouldCommitResults = _getConfig.shouldCommitResults,
      shouldExpandResults = _getConfig.shouldExpandResults;

  expect(isFirestore).toBeTruthy();
  expect(shouldCommitResults).toBeTruthy();
  expect(shouldExpandResults).toBeFalsy();
});