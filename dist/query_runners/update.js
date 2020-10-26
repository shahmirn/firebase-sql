"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = executeUpdate;
exports.updateItemWithSets = updateItemWithSets;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

var _query_parser = _interopRequireDefault(require("../parser/query_parser"));

var _update_db = require("../db/update_db");

var _select_db = require("../db/select_db");

var _constants = require("../constants");

var _fbSqlQuery = _interopRequireDefault(require("../models/fbSqlQuery"));

var _2 = require("..");

function executeUpdate(_x, _x2) {
  return _executeUpdate.apply(this, arguments);
}

function _executeUpdate() {
  _executeUpdate = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(query, callback) {
    var col, _queryParser$checkFor, collection, isFirestore, commitResults, sets;

    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            col = _query_parser["default"].getCollection(query, _constants.UPDATE_STATEMENT);
            _queryParser$checkFor = _query_parser["default"].checkForCrossDbQuery(col), collection = _queryParser$checkFor.collection, isFirestore = _queryParser$checkFor.isFirestore;
            commitResults = (0, _2.getConfig)().shouldCommitResults;
            _context2.next = 5;
            return _query_parser["default"].getSets(query);

          case 5:
            sets = _context2.sent;

            if (sets) {
              _context2.next = 8;
              break;
            }

            return _context2.abrupt("return", null);

          case 8:
            return _context2.abrupt("return", new Promise(function (resolve, reject) {
              _query_parser["default"].getWheres(query, function (wheres) {
                var queryDetails = new _fbSqlQuery["default"]();
                queryDetails.collection = collection;
                queryDetails.isFirestore = isFirestore; // queryDetails.db = db;

                queryDetails.wheres = wheres;
                (0, _select_db.getDataForSelect)(queryDetails, /*#__PURE__*/function () {
                  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(dataToAlter) {
                    var data, payload, results, updatePromises;
                    return _regenerator["default"].wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            data = dataToAlter.payload;
                            payload = generatePayload(data, sets);
                            results = {
                              statementType: _constants.UPDATE_STATEMENT,
                              payload: payload,
                              firebaseListener: dataToAlter.firebaseListener,
                              path: collection
                            };

                            if (!(commitResults && data)) {
                              _context.next = 11;
                              break;
                            }

                            updatePromises = [];
                            Object.keys(data).forEach(function (objKey) {
                              var updateObj = payload[objKey];
                              var path = collection + "/" + objKey;
                              var updatePromise = (0, _update_db.updateFields)(path, updateObj, Object.keys(sets), isFirestore);
                              updatePromises.push(updatePromise);
                            });
                            _context.next = 8;
                            return Promise.all(updatePromises);

                          case 8:
                            callback ? callback(results) : resolve(results);
                            _context.next = 12;
                            break;

                          case 11:
                            callback ? callback(results) : resolve(results);

                          case 12:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function (_x3) {
                    return _ref.apply(this, arguments);
                  };
                }());
              });
            }));

          case 9:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _executeUpdate.apply(this, arguments);
}

var generatePayload = function generatePayload(data, sets) {
  var payload = {};
  data && Object.keys(data).forEach(function (objKey) {
    var updateObj = updateItemWithSets(data[objKey], sets);
    payload[objKey] = updateObj;
  });
  return payload;
};

function updateItemWithSets(obj, sets) {
  var that = this;

  var updateObject = _lodash["default"].clone(obj);

  Object.keys(sets).forEach(function (objKey) {
    var thisSet = sets[objKey];

    if (thisSet && (0, _typeof2["default"])(thisSet) === "object" && thisSet.hasOwnProperty(_constants.FIRESTATION_DATA_PROP)) {
      //execute equation
      var newVal = thisSet.FIRESTATION_DATA_PROP;

      for (var i = 0; i < _constants.EQUATION_IDENTIFIERS.length; i++) {
        if (newVal.includes(_constants.EQUATION_IDENTIFIERS[i])) {
          updateObject[objKey] = that.executeUpdateEquation(updateObject, thisSet.FIRESTATION_DATA_PROP);
          return updateObject;
        }
      } //not an equation, treat it as an individual prop


      var finalValue = updateObject[newVal];

      if (newVal.includes(".")) {
        var props = newVal.split(".");
        finalValue = updateObject[props[0]];

        for (var _i = 1; updateObjecti < props.length; _i++) {
          finalValue = finalValue[props[_i]];
        }
      }

      updateObject[objKey] = finalValue;
    } else {
      if (objKey.includes("/")) {
        // "users/userId/name" -> users: { userId: { name: ""}}, etc
        if ((0, _typeof2["default"])(updateObject) !== "object") {
          updateObject = {};
        }

        var currentObject = updateObject;
        var dataPath = objKey.split("/");
        dataPath.forEach(function (val, i) {
          if (i === dataPath.length - 1) {
            currentObject[val] = thisSet;
          } else {
            var currVal = currentObject[val];
            currentObject[val] = currVal && (0, _typeof2["default"])(currVal) === "object" ? currentObject[val] : {};
          }

          currentObject = currentObject[val];
        });
      } else {
        updateObject[objKey] = thisSet;
      }
    }
  });
  return updateObject;
}