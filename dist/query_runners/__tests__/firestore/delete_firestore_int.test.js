"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _setup_db = require("../../test_resources/setup_db");

var _execute = _interopRequireDefault(require("../../../execute"));

var testData;
beforeEach( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _setup_db.clearDb)(true);

        case 2:
          testData = {
            collection1: {
              item1: {
                a: 1,
                b: false
              },
              item2: {
                a: 2,
                b: true
              }
            },
            collection2: {
              item3: {
                c: 3
              }
            }
          };
          _context.next = 5;
          return (0, _setup_db.injectData)("/collection1", testData.collection1, true);

        case 5:
          _context.next = 7;
          return (0, _setup_db.injectData)("/collection2", testData.collection2, true);

        case 7:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})));
afterAll( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
  return _regenerator["default"].wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return (0, _setup_db.clearDb)(true);

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
})));
test("delete entire collection", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
  var _yield$executeQuery, collection1, collection2;

  return _regenerator["default"].wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _execute["default"])("delete from collection1/");

        case 2:
          _context3.next = 4;
          return (0, _execute["default"])("select * from /;");

        case 4:
          _yield$executeQuery = _context3.sent;
          collection1 = _yield$executeQuery.collection1;
          collection2 = _yield$executeQuery.collection2;
          expect(collection1).toEqual(undefined);
          expect(collection2).toEqual(testData.collection2);

        case 9:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
})));
test("delete one child object", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
  var collection1;
  return _regenerator["default"].wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _execute["default"])("delete from collection1.item1");

        case 2:
          _context4.next = 4;
          return (0, _execute["default"])("select * from collection1;");

        case 4:
          collection1 = _context4.sent;
          delete testData.collection1.item1;
          expect(collection1).toEqual(testData.collection1);

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
})));
test("delete one prop", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
  var collection1;
  return _regenerator["default"].wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _execute["default"])("delete from collection1.item1.a");

        case 2:
          _context5.next = 4;
          return (0, _execute["default"])("select * from collection1;");

        case 4:
          collection1 = _context5.sent;
          delete testData.collection1.item1.a;
          expect(collection1).toEqual(testData.collection1);

        case 7:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5);
})));
test("delete where condition", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
  var collection1;
  return _regenerator["default"].wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return (0, _execute["default"])("delete from collection1 where b = true;");

        case 2:
          _context6.next = 4;
          return (0, _execute["default"])("select * from collection1;");

        case 4:
          collection1 = _context6.sent;
          delete testData.collection1.item2;
          expect(collection1).toEqual(testData.collection1);

        case 7:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6);
})));