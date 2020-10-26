"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injectData = exports.clearDb = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var admin = _interopRequireWildcard(require("firebase-admin"));

var _db_config = _interopRequireDefault(require("./db_config"));

var _execute = _interopRequireDefault(require("../../execute"));

var _ = require("../..");

var databaseURL = _db_config["default"].databaseURL,
    serviceAccount = _db_config["default"].serviceAccount;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
});
(0, _.configureFbsql)({
  app: admin
});
var firestore = admin.firestore();
var settings = {
  timestampsInSnapshots: true
};
firestore.settings(settings);

var clearDb = /*#__PURE__*/function () {
  var _ref = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee(isFirestore) {
    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            return _context.abrupt("return", isFirestore ? deleteFirestore() : admin.database().ref("/").set(null));

          case 1:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function clearDb(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.clearDb = clearDb;

var injectData = function injectData(path, data, isFirestore) {
  return isFirestore ? injectIntoFirestore(path, data) : admin.database().ref(path).set(data);
};

exports.injectData = injectData;

var injectIntoFirestore = function injectIntoFirestore(path, data) {
  var db = admin.firestore();
  var batch = db.batch();
  data && Object.keys(data).forEach(function (docTitle) {
    batch.set(db.collection(path).doc(docTitle), data[docTitle]);
  });
  return batch.commit();
};

var deleteFirestore = /*#__PURE__*/function () {
  var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
    var rootData, db, batch;
    return _regenerator["default"].wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            (0, _.configureFbsql)({
              isFirestore: true
            });
            _context2.next = 3;
            return (0, _execute["default"])("select * from /");

          case 3:
            rootData = _context2.sent;
            db = admin.firestore();
            batch = db.batch();
            rootData && Object.keys(rootData).forEach(function (colKey) {
              var collectionData = rootData[colKey];
              collectionData && Object.keys(collectionData).forEach(function (docId) {
                batch["delete"](db.collection(colKey).doc(docId));
              });
            });
            return _context2.abrupt("return", batch.commit());

          case 8:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));

  return function deleteFirestore() {
    return _ref2.apply(this, arguments);
  };
}();