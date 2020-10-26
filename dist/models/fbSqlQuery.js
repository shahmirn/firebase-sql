"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var FbSqlQuery = function FbSqlQuery() {
  (0, _classCallCheck2["default"])(this, FbSqlQuery);
  this.rawQuery = null;
  this.collection = null;
  this.path = null;
  this.selectedFields = null;
  this.wheres = null;
  this.orderBys = null;
  this.isFirestore = false;
  this.shouldApplyListener = false;
  this.shouldCommitResults = false;
};

exports["default"] = FbSqlQuery;