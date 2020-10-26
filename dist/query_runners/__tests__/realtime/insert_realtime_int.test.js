"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _setup_db = require("../../test_resources/setup_db");

var _insert = _interopRequireDefault(require("../../insert"));

var _select = _interopRequireDefault(require("../../select"));

beforeEach( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _setup_db.clearDb)();

        case 2:
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
          return (0, _setup_db.clearDb)();

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
})));
test("standard insert", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
  var res, val;
  return _regenerator["default"].wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _insert["default"])("insert into k (a) values ('b');");

        case 2:
          _context3.next = 4;
          return (0, _select["default"])("select * from k;");

        case 4:
          res = _context3.sent;
          val = res && res[Object.keys(res)[0]];
          expect(val).toEqual({
            a: "b"
          });

        case 7:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
})));
test("callback based insert", function (done) {
  (0, _insert["default"])("insert into g (i) values ('d');", function (res) {
    (0, _select["default"])("select * from g;", function (res) {
      var val = res && res[Object.keys(res)[0]];
      expect(val).toEqual({
        i: "d"
      });
      done();
    }, false);
  });
});
test("insert based on select data", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
  var res, val;
  return _regenerator["default"].wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _insert["default"])("insert into col (g) values ('h');");

        case 2:
          _context4.next = 4;
          return (0, _insert["default"])("insert into col2 select * from col;");

        case 4:
          _context4.next = 6;
          return (0, _select["default"])("select * from col2;");

        case 6:
          res = _context4.sent;
          val = res && res[Object.keys(res)[0]];
          expect(val).toEqual({
            g: "h"
          });

        case 9:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
})));