"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = executeQuery;

var _query_parser = _interopRequireDefault(require("./parser/query_parser"));

var _select = _interopRequireDefault(require("./query_runners/select"));

var _delete = _interopRequireDefault(require("./query_runners/delete"));

var _update = _interopRequireDefault(require("./query_runners/update"));

var _insert = _interopRequireDefault(require("./query_runners/insert"));

var _constants = require("./constants");

function executeQuery(query, callback, shouldApplyListener) {
  query = _query_parser["default"].formatAndCleanQuery(query);

  var statementType = _query_parser["default"].determineStatementType(query);

  switch (statementType) {
    case _constants.SELECT_STATEMENT:
      return (0, _select["default"])(query, callback, shouldApplyListener);

    case _constants.UPDATE_STATEMENT:
      return (0, _update["default"])(query, callback);

    case _constants.DELETE_STATEMENT:
      return (0, _delete["default"])(query, callback);

    case _constants.INSERT_STATEMENT:
      return (0, _insert["default"])(query, callback);

    default:
  }
}