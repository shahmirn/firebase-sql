"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _setup_db = require("../../test_resources/setup_db");

var _execute = _interopRequireDefault(require("../../../execute"));

var _ = require("../../..");

var localBlogs = {};
beforeEach( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          (0, _.configureFbsql)({
            isFirestore: true
          });
          _context.next = 3;
          return (0, _setup_db.clearDb)(true);

        case 3:
          localBlogs = {
            blog1: {
              title: "My first blog",
              description: "blog descrip"
            },
            blog2: {
              title: "My second blog",
              description: "wowza"
            }
          };
          _context.next = 6;
          return (0, _setup_db.injectData)("/blogs", localBlogs, true);

        case 6:
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
          (0, _.configureFbsql)({
            isFirestore: false
          });

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
})));
test("firestore: update all", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
  var blogsRes;
  return _regenerator["default"].wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _execute["default"])("update blogs set tall = true;");

        case 2:
          _context3.next = 4;
          return (0, _execute["default"])("select * from blogs;");

        case 4:
          blogsRes = _context3.sent;
          updateLocalBlogs({
            tall: true
          });
          expect(blogsRes).toEqual(localBlogs);

        case 7:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
})));
test("firestore: select based update", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
  var blogsRes;
  return _regenerator["default"].wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _execute["default"])("update blogs set title = (select title from blogs.blog1);");

        case 2:
          _context4.next = 4;
          return (0, _execute["default"])("select * from blogs;");

        case 4:
          blogsRes = _context4.sent;
          localBlogs.blog2.title = localBlogs.blog1.title;
          expect(blogsRes).toEqual(localBlogs);

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
})));
test("firestore: filtered update", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
  var blogsRes;
  return _regenerator["default"].wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _execute["default"])("update blogs set length=15 where description = 'wowza';");

        case 2:
          _context5.next = 4;
          return (0, _execute["default"])("select * from blogs;");

        case 4:
          blogsRes = _context5.sent;
          localBlogs.blog2.length = 15;
          expect(blogsRes).toEqual(localBlogs);

        case 7:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5);
})));

var updateLocalBlogs = function updateLocalBlogs() {
  var updates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  Object.keys(localBlogs).forEach(function (blogId) {
    Object.keys(updates).forEach(function (key) {
      localBlogs[blogId][key] = updates[key];
    });
  });
};