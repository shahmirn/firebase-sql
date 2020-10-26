"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = executeDelete;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _query_parser = _interopRequireDefault(require("../parser/query_parser"));

var _update_db = require("../db/update_db");

var _select_db = require("../db/select_db");

var _fbSqlQuery = _interopRequireDefault(require("../models/fbSqlQuery"));

var _constants = require("../constants");

var _ = require("..");

//TODO: refactor this away from firestation use case
// no need to grab the data first > commit for most ppl
function executeDelete(query, callback) {
  var col = _query_parser["default"].getCollection(query, _constants.DELETE_STATEMENT);

  var _queryParser$checkFor = _query_parser["default"].checkForCrossDbQuery(col),
      collection = _queryParser$checkFor.collection,
      isFirestore = _queryParser$checkFor.isFirestore;

  var commitResults = (0, _.getConfig)().shouldCommitResults;
  return new Promise(function (resolve, reject) {
    _query_parser["default"].getWheres(query, /*#__PURE__*/function () {
      var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(wheres) {
        var queryDetails, _yield$getDataForSele, payload, firebaseListener, deletePromises, results;

        return _regenerator["default"].wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                queryDetails = new _fbSqlQuery["default"]();
                queryDetails.collection = collection;
                queryDetails.isFirestore = isFirestore;
                queryDetails.wheres = wheres;
                _context.next = 6;
                return (0, _select_db.getDataForSelectAsync)(queryDetails);

              case 6:
                _yield$getDataForSele = _context.sent;
                payload = _yield$getDataForSele.payload;
                firebaseListener = _yield$getDataForSele.firebaseListener;

                if (!(payload && commitResults)) {
                  _context.next = 24;
                  break;
                }

                if (!["boolean", "number", "string"].includes((0, _typeof2["default"])(payload))) {
                  _context.next = 15;
                  break;
                }

                _context.next = 13;
                return (0, _update_db.deleteObject)(collection, isFirestore);

              case 13:
                _context.next = 24;
                break;

              case 15:
                if (!(!wheres && collection.indexOf("/") > 0)) {
                  _context.next = 20;
                  break;
                }

                _context.next = 18;
                return (0, _update_db.deleteObject)(collection, isFirestore);

              case 18:
                _context.next = 24;
                break;

              case 20:
                // Use select payload to determine deletes:
                // entire col: delete from users;
                // OR filtered: delete from users where age > x;
                deletePromises = [];
                Object.keys(payload).forEach(function (objKey) {
                  var path = collection + "/" + objKey;
                  deletePromises.push((0, _update_db.deleteObject)(path, isFirestore));
                });
                _context.next = 24;
                return Promise.all(deletePromises);

              case 24:
                results = {
                  statementType: _constants.DELETE_STATEMENT,
                  payload: payload,
                  firebaseListener: firebaseListener,
                  path: collection
                };
                callback ? callback(results) : resolve(results);

              case 26:
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