"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = executeInsert;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _query_parser = _interopRequireDefault(require("../parser/query_parser"));

var _update_db = require("../db/update_db");

var _constants = require("../constants");

var _ = require("..");

function executeInsert(query, callback) {
  var col = _query_parser["default"].getCollection(query, _constants.INSERT_STATEMENT);

  var _queryParser$checkFor = _query_parser["default"].checkForCrossDbQuery(col),
      collection = _queryParser$checkFor.collection,
      isFirestore = _queryParser$checkFor.isFirestore;

  var insertCount = _query_parser["default"].getInsertCount(query);

  var path = collection + "/";
  var commitResults = (0, _.getConfig)().shouldCommitResults;
  return new Promise(function (resolve, reject) {
    _query_parser["default"].getObjectsFromInsert(query, /*#__PURE__*/function () {
      var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(insertObjects) {
        var keys, insertPromises, i, prom, key, _prom, results;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!commitResults) {
                  _context.next = 7;
                  break;
                }

                keys = insertObjects && Object.keys(insertObjects);
                insertPromises = [];

                for (i = 1; i < insertCount; i++) {
                  //insert clones
                  prom = (0, _update_db.pushObject)(path, insertObjects[keys[0]], isFirestore);
                  insertPromises.push(prom);
                }

                for (key in insertObjects) {
                  _prom = (0, _update_db.pushObject)(path, insertObjects[key], isFirestore);
                  insertPromises.push(_prom);
                }

                _context.next = 7;
                return Promise.all(insertPromises);

              case 7:
                results = {
                  insertCount: insertCount,
                  statementType: _constants.INSERT_STATEMENT,
                  payload: insertObjects,
                  path: path
                };
                if (callback) callback(results);else {
                  resolve(results);
                }

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