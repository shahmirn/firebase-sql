"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unfilteredFirestoreQuery = exports.getDataForSelectAsync = exports.getDataForSelect = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _toArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toArray"));

var _index = require("../index");

var _string_helper = _interopRequireDefault(require("../helpers/string_helper"));

var _date_helper = require("../helpers/date_helper");

var _fbSqlQuery = _interopRequireDefault(require("../models/fbSqlQuery"));

var getDataForSelectAsync = function getDataForSelectAsync(query) {
  query.shouldApplyListener = false;
  return new Promise(function (resolve, reject) {
    getDataForSelect(query, function (res) {
      resolve(res);
    });
  });
};

exports.getDataForSelectAsync = getDataForSelectAsync;

var getDataForSelect = function getDataForSelect(query, callback) {
  var wheres = query.wheres,
      selectedFields = query.selectedFields,
      isFirestore = query.isFirestore;
  var app = (0, _index.getApp)();
  var db = isFirestore ? app.firestore() : app.database(); //TODO: reimplement listeners, using firestore listeners as well

  var results = {
    statementType: "SELECT_STATEMENT",
    path: query.collection,
    orderBys: query.orderBys,
    payload: {},
    isFirestore: isFirestore
  };

  if (!wheres || wheres[0] && wheres[0] && wheres[0].error === "NO_EQUALITY_STATEMENTS") {
    //unfilterable query, grab whole collection
    var collectionCallback = function collectionCallback(res) {
      if (wheres && wheres[0]) {
        res.payload = filterWheresAndNonSelectedFields(res.payload, wheres, selectedFields); // results.firebaseListener = ref;
      }

      return callback(res);
    };

    query.isFirestore ? unfilteredFirestoreQuery(db, results, query, collectionCallback) : queryEntireRealtimeCollection(db, results, query, collectionCallback);
  } else {
    //filterable query
    query.isFirestore ? executeFilteredFirestoreQuery(db, results, query, callback) : executeFilteredRealtimeQuery(db, results, query, callback);
  }
};

exports.getDataForSelect = getDataForSelect;

var unfilteredFirestoreQuery = function unfilteredFirestoreQuery(db, results, query, callback) {
  var collection = query.collection,
      selectedFields = query.selectedFields,
      shouldApplyListener = query.shouldApplyListener;

  if (collection === "/") {
    //root query: select * from /;
    // TODO: Listener
    db.getCollections().then(function (collections) {
      if (collections.length === 0) {
        // no collections
        results.payload = null;
        return callback(results);
      }

      var numDone = 0;
      var firestoreData = {};
      collections.forEach(function (collection) {
        var colId = collection.id;
        var query = new _fbSqlQuery["default"]();
        query.collection = colId;
        unfilteredFirestoreQuery(db, {
          payload: {}
        }, query, function (res) {
          firestoreData[colId] = res.payload;

          if (++numDone >= collections.length) {
            results.payload = firestoreData;
            return callback(results);
          }
        });
      });
    })["catch"](function (err) {
      console.log("Err getting cols:", err);
      results.error = err.message;
      return callback(results);
    });
  } else if (collection.includes("/")) {
    var _collection$split = collection.split("/"),
        _collection$split2 = (0, _toArray2["default"])(_collection$split),
        col = _collection$split2[0],
        docId = _collection$split2[1],
        propPath = _collection$split2.slice(2); // users.userId.age => col: users, docId:userId, propPath: [age]


    docId = _string_helper["default"].replaceAll(docId, "/", ".");
    var ref = db.collection(col).doc(docId);
    var fetchData = shouldApplyListener ? listenToFirestoreDoc : getFirstoreDocOnce;
    fetchData(ref, function (_ref) {
      var docData = _ref.docData,
          unsub = _ref.unsub;

      if (!docData) {
        results.error = {
          message: "No such document"
        };
        return callback(results);
      }

      results.payload = propPath.length > 0 ? getDataAtPropPath(docData, propPath) : docData;
      results = removeFieldsAndApplyUnsub(results, selectedFields, {
        type: "firestore",
        unsub: unsub
      });
      return callback(results);
    }, function (err) {
      results.error = {
        message: "No such document"
      };
      return callback(results);
    });
  } else {
    //select * from collection
    var _fetchData = shouldApplyListener ? listenToFirestoreCol : getFirstoreColOnce;

    _fetchData(db.collection(collection), function (_ref2) {
      var data = _ref2.data,
          unsub = _ref2.unsub;
      results.payload = data;
      results = removeFieldsAndApplyUnsub(results, selectedFields, {
        type: "firestore",
        unsub: unsub
      });
      return callback(results);
    }, function (err) {
      results.error = err.message;
      return callback(results);
    });
  }
};

exports.unfilteredFirestoreQuery = unfilteredFirestoreQuery;

var removeFieldsAndApplyUnsub = function removeFieldsAndApplyUnsub(results, selectedFields, _ref3) {
  var type = _ref3.type,
      unsub = _ref3.unsub;

  if (selectedFields) {
    results.payload = removeNonSelectedFieldsFromResults(results.payload, selectedFields);
  }

  if (type && unsub) {
    results.firebaseListener = {
      type: type,
      unsubscribe: function unsubscribe() {
        return unsub();
      }
    };
  }

  return results;
};

var getDataAtPropPath = function getDataAtPropPath(data) {
  var propPath = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var propData;
  propPath.forEach(function (prop) {
    var subData = data[prop];
    if (!subData) return null;
    propData = subData;
  });
  return propData;
};

var getFirstoreDocOnce = function getFirstoreDocOnce(ref, callback, onErr) {
  ref.get().then(function (doc) {
    return callback({
      docData: doc.exists ? doc.data() : null
    });
  })["catch"](onErr);
};

var listenToFirestoreDoc = function listenToFirestoreDoc(ref, callback, onErr) {
  var unsub = ref.onSnapshot(function (doc) {
    return callback({
      docData: doc.exists ? doc.data() : null,
      unsub: unsub
    }, onErr);
  });
};

var getFirstoreColOnce = function getFirstoreColOnce(ref, callback, onErr) {
  ref.get().then(function (snapshot) {
    var data = {};
    snapshot.forEach(function (doc) {
      data[doc.id] = doc.data();
    });
    return callback({
      data: data
    });
  })["catch"](onErr);
};

var listenToFirestoreCol = function listenToFirestoreCol(ref, callback, onErr) {
  var unsub = ref.onSnapshot(function (snapshot) {
    var data = {};
    snapshot.forEach(function (doc) {
      data[doc.id] = doc.data();
    });
    return callback({
      data: data,
      unsub: unsub
    });
  }, onErr);
};

var queryEntireRealtimeCollection = function queryEntireRealtimeCollection(db, results, query, callback) {
  var collection = query.collection,
      selectedFields = query.selectedFields,
      shouldApplyListener = query.shouldApplyListener;
  var ref = db.ref(collection);

  var queryCallback = function queryCallback(snapshot) {
    results.payload = snapshot.val();

    if (selectedFields) {
      results.payload = removeNonSelectedFieldsFromResults(results.payload, selectedFields);
    }

    results.firebaseListener = shouldApplyListener ? {
      unsubscribe: function unsubscribe() {
        return ref.off("value");
      },
      type: "realtime"
    } : null;
    return callback(results);
  };

  shouldApplyListener ? ref.on("value", queryCallback) : ref.once("value").then(queryCallback);
};

var executeFilteredFirestoreQuery = function executeFilteredFirestoreQuery(db, results, query, callback) {
  var collection = query.collection,
      selectedFields = query.selectedFields,
      wheres = query.wheres,
      shouldApplyListener = query.shouldApplyListener;
  var mainWhere = wheres[0]; // TODO: where chaining if we have multiple filterable, rather than client side filter
  // ie: citiesRef.where("state", "==", "CO").where("name", "==", "Denver")
  // TODO: promise version

  var unsub = db.collection(collection).where(mainWhere.field, mainWhere.comparator, mainWhere.value).onSnapshot(function (snapshot) {
    var payload = {};
    snapshot.forEach(function (doc) {
      payload[doc.id] = doc.data();
    });
    payload = filterWheresAndNonSelectedFields(payload, wheres, selectedFields);
    results.payload = payload;
    results.firebaseListener = {
      type: "firestore",
      unsubscribe: function unsubscribe() {
        return unsub();
      }
    };
    callback(results);
  }, function (err) {
    results.error = err.message;
    return callback(results);
  });
};

var executeFilteredRealtimeQuery = function executeFilteredRealtimeQuery(db, results, query, callback) {
  var collection = query.collection,
      selectedFields = query.selectedFields,
      wheres = query.wheres,
      shouldApplyListener = query.shouldApplyListener;
  var mainWhere = wheres[0];
  var ref = db.ref(collection).orderByChild(mainWhere.field).equalTo(mainWhere.value);

  var resCallback = function resCallback(snapshot) {
    results.payload = filterWheresAndNonSelectedFields(snapshot.val(), wheres, selectedFields);
    results.firebaseListener = shouldApplyListener ? {
      unsubscribe: function unsubscribe() {
        return ref.off("value");
      },
      type: "realtime"
    } : null;
    return callback(results);
  };

  shouldApplyListener ? ref.on("value", resCallback) : ref.once("value").then(resCallback);
};

var filterWheresAndNonSelectedFields = function filterWheresAndNonSelectedFields(resultsPayload, wheres, selectedFields) {
  if (wheres.length > 1) {
    resultsPayload = filterResultsByWhereStatements(resultsPayload, wheres.slice(1));
  }

  if (selectedFields) {
    resultsPayload = removeNonSelectedFieldsFromResults(resultsPayload, selectedFields);
  }

  return resultsPayload;
};

var removeNonSelectedFieldsFromResults = function removeNonSelectedFieldsFromResults(results, selectedFields) {
  if (!results || !selectedFields) {
    return results;
  }

  Object.keys(results).forEach(function (objKey) {
    if ((0, _typeof2["default"])(results[objKey]) !== "object") {
      if (!selectedFields[objKey]) {
        delete results[objKey];
      }
    } else {
      Object.keys(results[objKey]).forEach(function (propKey) {
        if (!selectedFields[propKey]) {
          delete results[objKey][propKey];
        }
      });
    }
  });
  return Object.keys(results).length === 1 ? results[Object.keys(results)[0]] : results;
};

var filterResultsByWhereStatements = function filterResultsByWhereStatements(results, whereStatements) {
  if (!results) {
    return null;
  }

  var returnedResults = {};
  var nonMatch = {};

  var _loop = function _loop(i) {
    var where = whereStatements[i];
    Object.keys(results).forEach(function (key) {
      var thisResult = results[key][where.field];

      if (!conditionIsTrue(thisResult, where.value, where.comparator)) {
        nonMatch[key] = results[key];
      }
    });
  };

  for (var i = 0; i < whereStatements.length; i++) {
    _loop(i);
  }

  if (nonMatch) {
    Object.keys(results).forEach(function (key) {
      if (!nonMatch[key]) {
        returnedResults[key] = results[key];
      }
    });
    return returnedResults;
  } else {
    return results;
  }
};

var conditionIsTrue = function conditionIsTrue(val1, val2, comparator) {
  switch (comparator) {
    case "==":
      return determineEquals(val1, val2);

    case "!=":
      return !determineEquals(val1, val2);

    case "<=":
    case "<":
    case ">=":
    case ">":
      return determineGreaterOrLess(val1, val2, comparator);

    case "like":
      return _string_helper["default"].determineStringIsLike(val1, val2);

    case "!like":
      return !_string_helper["default"].determineStringIsLike(val1, val2);

    default:
      throw "Unrecognized comparator: " + comparator;
  }
};

var determineEquals = function determineEquals(val1, val2) {
  val1 = typeof val1 == "undefined" || val1 == "null" ? null : val1;
  val2 = typeof val2 == "undefined" || val2 == "null" ? null : val2;
  return val1 === val2;
};

var determineGreaterOrLess = function determineGreaterOrLess(val1, val2, comparator) {
  var isNum = false;

  if (isNaN(val1) || isNaN(val2)) {
    if ((0, _date_helper.isValidDate)(val1) && (0, _date_helper.isValidDate)(val2)) {
      return (0, _date_helper.executeDateComparison)(val1, val2, comparator);
    }
  } else {
    isNum = true;
  }

  switch (comparator) {
    case "<=":
      return isNum ? val1 <= val2 : val1.length <= val2.length;

    case ">=":
      return isNum ? val1 >= val2 : val1.length >= val2.length;

    case ">":
      return isNum ? val1 > val2 : val1.length < val2.length;

    case "<":
      return isNum ? val1 < val2 : val1.length < val2.length;
  }
};