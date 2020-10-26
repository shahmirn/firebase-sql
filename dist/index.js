"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.getApp = exports.getConfig = exports.configureFbsql = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _execute = _interopRequireDefault(require("./execute"));

require("@babel/polyfill");

var FbSql = function FbSql() {
  var _this = this;

  (0, _classCallCheck2["default"])(this, FbSql);
  (0, _defineProperty2["default"])(this, "configure", function (params) {
    params && Object.keys(params).forEach(function (key) {
      var val = params[key];

      if (val || val === false) {
        _this[key] = val;
      }
    });
  });
  (0, _defineProperty2["default"])(this, "killListeners", function () {});
  (0, _defineProperty2["default"])(this, "getConfig", function () {
    return {
      app: _this.app,
      isFirestore: _this.isFirestore,
      shouldCommitResults: _this.shouldCommitResults,
      shouldExpandResults: _this.shouldExpandResults
    };
  });
  (0, _defineProperty2["default"])(this, "getApp", function () {
    return _this.app;
  });
  (0, _defineProperty2["default"])(this, "execute", function (query, callback, shouldApplyListener) {
    if (!query) throw new Error("Must provide a string query argument, ie: execute(\"SELECT * FROM users\")");
    return (0, _execute["default"])(query, callback, callback && shouldApplyListener !== false);
  });
  this.app = null;
  this.isFirestore = false;
  this.shouldCommitResults = true;
  this.shouldExpandResults = false;
}
/**
 * @param {object} params - fbsql configuration
 * @param {object} [params.app] your firebase app
 * @param {boolean} [params.isFirestore] run queries against firestore?
 * @param {boolean} [params.shouldCommitResults] commit results on inserts, updates, deletes?
 * @param {boolean} [params.shouldExpandResults] return query info other than payload?
 */
;

var fbsql = new FbSql();
var configureFbsql = fbsql.configure,
    getApp = fbsql.getApp,
    getConfig = fbsql.getConfig;
exports.getConfig = getConfig;
exports.getApp = getApp;
exports.configureFbsql = configureFbsql;
var _default = fbsql.execute;
exports["default"] = _default;