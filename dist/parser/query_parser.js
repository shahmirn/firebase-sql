"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _string_helper = _interopRequireDefault(require("../helpers/string_helper"));

var _constants = require("../constants");

var _index = require("../index");

var _select = _interopRequireDefault(require("../query_runners/select"));

var _execute = _interopRequireDefault(require("../execute"));

var QueryParser = /*#__PURE__*/function () {
  function QueryParser() {
    (0, _classCallCheck2["default"])(this, QueryParser);
  }

  (0, _createClass2["default"])(QueryParser, [{
    key: "formatAndCleanQuery",
    value: function formatAndCleanQuery(query) {
      query = _string_helper["default"].replaceAll(query, /(\/\/|--).+/, "");
      query = query.replace(/\r?\n|\r/g, " ");
      query = query.trim();
      query = this.removeWrappedParenthesis(query);
      return query;
    }
  }, {
    key: "removeWrappedParenthesis",
    value: function removeWrappedParenthesis(query) {
      return /^\(.+\)$/.test(query) ? query.substring(1, query.length - 1) : query;
    }
  }, {
    key: "determineStatementType",
    value: function determineStatementType(query) {
      var q = query.trim();
      var firstTerm = q.split(" ")[0].trim().toLowerCase();

      switch (firstTerm) {
        case "select":
          return _constants.SELECT_STATEMENT;

        case "update":
          return _constants.UPDATE_STATEMENT;

        case "insert":
          return _constants.INSERT_STATEMENT;

        case "delete":
          return _constants.DELETE_STATEMENT;

        default:
          return _constants.SELECT_STATEMENT;
      }
    }
  }, {
    key: "getWheres",
    value: function getWheres(query, callback) {
      var _this = this;

      var whereIndexStart = query.toUpperCase().indexOf(" WHERE ") + 1;

      if (whereIndexStart < 1) {
        return callback(null);
      }

      var orderByIndex = query.toUpperCase().indexOf("ORDER BY");
      var whereIndexEnd = orderByIndex >= 0 ? orderByIndex : query.length;
      var wheresArr = query.substring(whereIndexStart + 5, whereIndexEnd).split(/\sand\s/i);
      wheresArr[wheresArr.length - 1] = wheresArr[wheresArr.length - 1].replace(";", "");
      var wheres = [];
      wheresArr.forEach(function (where) {
        where = _string_helper["default"].replaceAllIgnoreCase(where, "not like", "!like");

        var eqCompAndIndex = _this.determineComparatorAndIndex(where);

        var whereObj = {
          field: _string_helper["default"].replaceAll(where.substring(0, eqCompAndIndex.index).trim(), "\\.", "/"),
          comparator: eqCompAndIndex.comparator
        };
        var comparatorLength = eqCompAndIndex.comparator == "==" ? 1 : eqCompAndIndex.comparator.length;
        var unparsedVal = where.substring(eqCompAndIndex.index + comparatorLength).trim();

        var val = _string_helper["default"].getParsedValue(unparsedVal);

        var isFirestore = (0, _index.getConfig)().isFirestore;

        if (typeof val === "string" && val.charAt(0) === "(" && val.charAt(val.length - 1) === ")") {
          (0, _select["default"])(val.substring(1, val.length - 1), function (results) {
            whereObj.value = results.payload;
            wheres.push(whereObj);

            if (wheresArr.length === wheres.length) {
              return callback(_this.optimizeWheres(wheres, isFirestore));
            }
          });
        } else {
          whereObj.value = val;
          wheres.push(whereObj);

          if (wheresArr.length === wheres.length) {
            return callback(_this.optimizeWheres(wheres, isFirestore));
          }
        }
      });
    }
  }, {
    key: "getSets",
    value: function () {
      var _getSets = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2(query) {
        var setIndexStart, whereIndexStart, setsArr, sets;
        return _regenerator["default"].wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                setIndexStart = query.indexOf(" set ") + 1;

                if (!(setIndexStart < 1)) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt("return", null);

              case 3:
                whereIndexStart = query.indexOf(" where ") + 1;

                if (whereIndexStart > 0) {
                  setsArr = query.substring(setIndexStart + 3, whereIndexStart).split(", ");
                } else {
                  setsArr = query.substring(setIndexStart + 3).split(", ");
                  setsArr[setsArr.length - 1] = setsArr[setsArr.length - 1].replace(";", "");
                }

                sets = {};
                setsArr.forEach( /*#__PURE__*/function () {
                  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(item) {
                    var _item$split, _item$split2, key, val;

                    return _regenerator["default"].wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _item$split = item.split("="), _item$split2 = (0, _slicedToArray2["default"])(_item$split, 2), key = _item$split2[0], val = _item$split2[1];

                            if (!(key && val)) {
                              _context.next = 8;
                              break;
                            }

                            if (!/^\s*\(?(select).+from.+\)?/i.test(val)) {
                              _context.next = 6;
                              break;
                            }

                            _context.next = 5;
                            return (0, _execute["default"])(val);

                          case 5:
                            val = _context.sent;

                          case 6:
                            key = key.replace(".", "/").trim();
                            sets[key] = _string_helper["default"].getParsedValue(val.trim(), true);

                          case 8:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee);
                  }));

                  return function (_x2) {
                    return _ref.apply(this, arguments);
                  };
                }());
                return _context2.abrupt("return", sets);

              case 8:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function getSets(_x) {
        return _getSets.apply(this, arguments);
      }

      return getSets;
    }()
  }, {
    key: "getOrderBys",
    value: function getOrderBys(query) {
      var caps = query.toUpperCase();
      var ORDER_BY = "ORDER BY";
      var index = caps.indexOf(ORDER_BY);

      if (index < 0) {
        return null;
      }

      var orderByStr = query.substring(index + ORDER_BY.length);
      var split = orderByStr.split(",");
      var orderBys = split.map(function (orderBy) {
        var propToSort = orderBy.replace(";", "").trim();
        propToSort = propToSort.indexOf(" ") >= 0 ? propToSort.substring(0, propToSort.indexOf(" ")) : propToSort;
        var orderByObj = {
          ascending: true,
          propToSort: propToSort.trim()
        };

        if (orderBy.toUpperCase().includes("DESC")) {
          orderByObj.ascending = false;
        }

        return orderByObj;
      });
      return orderBys;
    }
  }, {
    key: "getCollection",
    value: function getCollection(q, statementType) {
      var query = q.replace(/\(.*\)/, "").trim(); //removes nested selects

      var terms = query.split(" ");
      var strip = _string_helper["default"].stripEncasingSlashes;

      if (statementType === _constants.UPDATE_STATEMENT) {
        return strip(_string_helper["default"].replaceAll(terms[1], /\./, "/"));
      } else if (statementType === _constants.SELECT_STATEMENT) {
        if (terms.length === 2 && terms[0] === "from") {
          return strip(_string_helper["default"].replaceAll(terms[1], ".", "/"));
        } else if (terms.length === 1) {
          var _collection = terms[0].replace(";", "");

          return strip(_string_helper["default"].replaceAll(_collection, /\./, "/"));
        }

        var collectionIndexStart = query.indexOf("from ") + 4;

        if (collectionIndexStart < 0) {
          throw "Error determining collection.";
        }

        if (collectionIndexStart < 5) {
          return strip(_string_helper["default"].replaceAll(terms[0], /\./, "/"));
        }

        var trimmedCol = query.substring(collectionIndexStart).trim();
        var collectionIndexEnd = trimmedCol.match(/\ |;|$/).index;
        var collection = trimmedCol.substring(0, collectionIndexEnd);
        return strip(_string_helper["default"].replaceAll(collection, /\./, "/"));
      } else if (statementType === _constants.INSERT_STATEMENT) {
        var collectionToInsert = terms[1].toUpperCase() === "INTO" ? terms[2] : terms[3];
        return strip(_string_helper["default"].replaceAll(collectionToInsert, /\./, "/"));
      } else if (statementType === _constants.DELETE_STATEMENT) {
        var index = terms.length > 2 ? 2 : 1;

        var term = _string_helper["default"].replaceAll(terms[index], /;/, "");

        return strip(_string_helper["default"].replaceAll(term, /\./, "/"));
      }

      throw "Error determining collection.";
    }
  }, {
    key: "getSelectedFields",
    value: function getSelectedFields(q) {
      var query = q.trim();

      if (!query.startsWith("select ") || query.startsWith("select *")) {
        return null;
      }

      var regExp = /(.*select\s+)(.*)(\s+from.*)/;
      var froms = query.replace(regExp, "$2");

      if (froms.length === query.length) {
        return null;
      }

      var fields = froms.split(",");

      if (fields.length === 0) {
        return null;
      }

      var selectedFields = {};
      fields.map(function (field) {
        selectedFields[field.trim()] = true;
      });
      return selectedFields;
    }
  }, {
    key: "getObjectsFromInsert",
    value: function getObjectsFromInsert(query, callback) {
      // const shouldApplyListener = getConfig().shouldCommitResults;
      //insert based on select data
      if (/^(insert into )[^\s]+( select).+/i.test(query)) {
        var selectStatement = query.substring(query.toUpperCase().indexOf("SELECT ")).trim();
        (0, _select["default"])(selectStatement, function (selectData) {
          return callback(selectData.payload || selectData);
        });
      } else {
        //traditional insert
        var keysStr = query.substring(query.indexOf("(") + 1, query.indexOf(")"));
        var keys = keysStr.split(",");
        var valuesStr = query.match(/(values).+\)/)[0];
        var valuesStrArr = valuesStr.split(/[\(](?!\))/); //splits on "(", unless its a function "func()"

        valuesStrArr.shift(); //removes "values ("

        var valuesArr = valuesStrArr.map(function (valueStr) {
          return valueStr.substring(0, valueStr.lastIndexOf(")")).split(",");
        });

        if (!keys || !valuesArr) {
          throw "Badly formatted insert statement";
        }

        var insertObjects = {};
        valuesArr.forEach(function (values, valuesIndex) {
          var insertObject = {};
          keys.forEach(function (key, keyIndex) {
            insertObject[_string_helper["default"].getParsedValue(key.trim())] = _string_helper["default"].getParsedValue(values[keyIndex].trim());
          });
          insertObjects["pushId_" + valuesIndex] = insertObject;
        });
        return callback(insertObjects);
      }
    }
  }, {
    key: "determineComparatorAndIndex",
    value: function determineComparatorAndIndex(where) {
      var notEqIndex = this.getNotEqualIndex(where);

      if (notEqIndex >= 0) {
        return {
          comparator: "!=",
          index: notEqIndex
        };
      }

      var greaterThanEqIndex = where.indexOf(">=");

      if (greaterThanEqIndex >= 0) {
        return {
          comparator: ">=",
          index: greaterThanEqIndex
        };
      }

      var greaterThanIndex = where.indexOf(">");

      if (greaterThanIndex >= 0) {
        return {
          comparator: ">",
          index: greaterThanIndex
        };
      }

      var lessThanEqIndex = where.indexOf("<=");

      if (lessThanEqIndex >= 0) {
        return {
          comparator: "<=",
          index: lessThanEqIndex
        };
      }

      var lessThanIndex = where.indexOf("<");

      if (lessThanIndex >= 0) {
        return {
          comparator: "<",
          index: lessThanIndex
        };
      }

      var notLikeIndex = where.toLowerCase().indexOf("!like");

      if (notLikeIndex >= 0) {
        return {
          comparator: "!like",
          index: notLikeIndex
        };
      }

      var likeIndex = where.toLowerCase().indexOf("like");

      if (likeIndex >= 0) {
        return {
          comparator: "like",
          index: likeIndex
        };
      }

      var eqIndex = where.indexOf("=");

      if (eqIndex >= 0) {
        return {
          comparator: "==",
          index: eqIndex
        };
      }

      throw "Unrecognized comparator in where clause: '" + where + "'.";
    }
  }, {
    key: "getInsertCount",
    value: function getInsertCount(query) {
      var splitQ = query.trim().split(" ");

      if (splitQ[0].toUpperCase() === "INSERT" && parseInt(splitQ[1]) > 1) {
        return parseInt(splitQ[1]);
      }

      return 1;
    }
  }, {
    key: "getNotEqualIndex",
    value: function getNotEqualIndex(condition) {
      return _string_helper["default"].regexIndexOf(condition, /!=|<>/);
    }
  }, {
    key: "optimizeWheres",
    value: function optimizeWheres(wheres, isFirestore) {
      var queryableComparators = isFirestore ? ["==", "<", "<=", ">", ">="] : ["=="]; //rearranges wheres so first statement is an equal, or error if no equals
      //firebase has no != method, so we'll grab whole collection, and filter on client

      var firstNotEqStatement = wheres[0];

      for (var i = 0; i < wheres.length; i++) {
        if (wheres[i].value != null && queryableComparators.includes(wheres[i].comparator)) {
          wheres[0] = wheres[i];
          wheres[i] = firstNotEqStatement;
          return wheres;
        }
      }

      wheres.unshift({
        error: _constants.NO_EQUALITY_STATEMENTS
      });
      return wheres;
    }
  }, {
    key: "checkForCrossDbQuery",
    value: function checkForCrossDbQuery(collection) {
      var isFirestore = (0, _index.getConfig)().isFirestore;

      if (/(db|firestore)/i.test(collection)) {
        if ( // only flip the db if it's not already enabled
        isFirestore && /(db)/i.test(collection) || !isFirestore && /(firestore)/i.test(collection)) {
          isFirestore = !isFirestore;
        }

        collection = collection.substring(collection.indexOf("/") + 1);

        if (collection === "db" || collection === "firestore") {
          collection = "/";
        }
      }

      return {
        collection: collection,
        isFirestore: isFirestore
      };
    }
  }]);
  return QueryParser;
}();

var querParser = new QueryParser();
var _default = querParser;
exports["default"] = _default;