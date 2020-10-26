"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = executeSelect;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _query_parser = _interopRequireDefault(require("../parser/query_parser"));

var _select_db = require("../db/select_db");

var _fbSqlQuery = _interopRequireDefault(require("../models/fbSqlQuery"));

var _constants = require("../constants");

var _index = require("../index");

function executeSelect(query, callback) {
  var shouldApplyListener = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var col = _query_parser["default"].getCollection(query, _constants.SELECT_STATEMENT);

  var _queryParser$checkFor = _query_parser["default"].checkForCrossDbQuery(col),
      collection = _queryParser$checkFor.collection,
      isFirestore = _queryParser$checkFor.isFirestore;

  var queryDetails = new _fbSqlQuery["default"]();
  queryDetails.collection = collection;
  queryDetails.isFirestore = isFirestore;
  queryDetails.orderBys = _query_parser["default"].getOrderBys(query);
  queryDetails.selectedFields = _query_parser["default"].getSelectedFields(query);
  queryDetails.shouldApplyListener = callback && shouldApplyListener ? true : false;
  return new Promise(function (resolve, reject) {
    _query_parser["default"].getWheres(query, /*#__PURE__*/function () {
      var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(wheres) {
        var results;
        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                queryDetails.wheres = wheres;

                if (!callback) {
                  _context.next = 5;
                  break;
                }

                (0, _select_db.getDataForSelect)(queryDetails, function (results) {
                  callback(customizeResults(results));
                });
                _context.next = 9;
                break;

              case 5:
                _context.next = 7;
                return (0, _select_db.getDataForSelectAsync)(queryDetails);

              case 7:
                results = _context.sent;
                resolve(customizeResults(results));

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
  });
}

var customizeResults = function customizeResults(results) {
  return (0, _index.getConfig)().shouldExpandResults ? results : results.payload;
};