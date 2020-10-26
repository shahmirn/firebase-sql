"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _setup_db = require("../../test_resources/setup_db");

var _select = _interopRequireDefault(require("../../select"));

var _index = require("../../../index");

var users = {
  abc: {
    email: "ab@c.com",
    age: 20,
    isOnline: false
  },
  def: {
    email: "de@ef.gov",
    age: 25,
    isOnline: true,
    bio: "what a guy"
  }
};
beforeEach( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          (0, _index.configureFbsql)({
            shouldExpandResults: false,
            isFirestore: false
          });
          _context.next = 3;
          return (0, _setup_db.clearDb)();

        case 3:
          _context.next = 5;
          return (0, _setup_db.injectData)("users", users);

        case 5:
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
}))); // important: must make sure callback queries are not listeners,
// otherwise they'll refire when other tests alter the database.
// can pass false after callback arg to prevent a listener

test("callback working", function (done) {
  (0, _index.configureFbsql)({
    shouldExpandResults: true
  });
  (0, _select["default"])("select * from users", function (_ref3) {
    var payload = _ref3.payload,
        firebaseListener = _ref3.firebaseListener;
    expect(payload).toEqual(users);
    done();
  }, false);
});
test("async working", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
  var data;
  return _regenerator["default"].wrap(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return (0, _select["default"])("select * from users");

        case 2:
          data = _context3.sent;
          expect(users).toEqual(data);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  }, _callee3);
})));
test("select specific property", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
  var data;
  return _regenerator["default"].wrap(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _context4.next = 2;
          return (0, _select["default"])("select * from users.abc.age");

        case 2:
          data = _context4.sent;
          expect(users.abc.age).toEqual(data);

        case 4:
        case "end":
          return _context4.stop();
      }
    }
  }, _callee4);
})));
test("select certain fields", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
  var data;
  return _regenerator["default"].wrap(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          _context5.next = 2;
          return (0, _select["default"])("select email, age from users");

        case 2:
          data = _context5.sent;
          Object.keys(data).forEach(function (id) {
            var user = data[id];
            expect(user.age).toBeTruthy();
            expect(user.email).toBeTruthy();
            expect(user.isOnline).toBeUndefined();
            expect(user.bio).toBeUndefined();
          });

        case 4:
        case "end":
          return _context5.stop();
      }
    }
  }, _callee5);
})));
test("expanded results working", function (done) {
  (0, _index.configureFbsql)({
    shouldExpandResults: true
  });
  (0, _select["default"])("select * from users.def", function (results) {
    var path = results.path,
        payload = results.payload,
        firebaseListener = results.firebaseListener;
    expect(payload).toEqual(users.def);
    expect("users/def").toEqual(path);
    expect((0, _typeof2["default"])(firebaseListener)).toEqual("object");
    expect((0, _typeof2["default"])(firebaseListener.unsubscribe)).toEqual("function");
    firebaseListener.unsubscribe();
    (0, _index.configureFbsql)({
      shouldExpandResults: false
    });
    done();
  });
});
test("where queries working", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
  var results;
  return _regenerator["default"].wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return (0, _select["default"])("select * from users where age=25");

        case 2:
          results = _context6.sent;
          expect({
            def: users.def
          }).toEqual(results);

        case 4:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6);
})));
test("string regex", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
  var results;
  return _regenerator["default"].wrap(function _callee7$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          _context7.next = 2;
          return (0, _select["default"])("select * from users where email like %@c.com");

        case 2:
          results = _context7.sent;
          expect({
            abc: users.abc
          }).toEqual(results);

        case 4:
        case "end":
          return _context7.stop();
      }
    }
  }, _callee7);
})));
test("less than operator", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
  var results;
  return _regenerator["default"].wrap(function _callee8$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          _context8.next = 2;
          return (0, _select["default"])("select * from users where age <25;");

        case 2:
          results = _context8.sent;
          expect({
            abc: users.abc
          }).toEqual(results);

        case 4:
        case "end":
          return _context8.stop();
      }
    }
  }, _callee8);
})));
test("less than equal to operator", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9() {
  var results;
  return _regenerator["default"].wrap(function _callee9$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          _context9.next = 2;
          return (0, _select["default"])("select * from users where age <=25;");

        case 2:
          results = _context9.sent;
          expect(users).toEqual(results);

        case 4:
        case "end":
          return _context9.stop();
      }
    }
  }, _callee9);
})));
test("greater than operator", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee10() {
  var results;
  return _regenerator["default"].wrap(function _callee10$(_context10) {
    while (1) {
      switch (_context10.prev = _context10.next) {
        case 0:
          _context10.next = 2;
          return (0, _select["default"])("select * from users where age >20;");

        case 2:
          results = _context10.sent;
          expect({
            def: users.def
          }).toEqual(results);

        case 4:
        case "end":
          return _context10.stop();
      }
    }
  }, _callee10);
})));
test("greater than equal to operator", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee11() {
  var results;
  return _regenerator["default"].wrap(function _callee11$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return (0, _select["default"])("select * from users where age>=20;");

        case 2:
          results = _context11.sent;
          expect(users).toEqual(results);

        case 4:
        case "end":
          return _context11.stop();
      }
    }
  }, _callee11);
})));
test("query by null", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee12() {
  var results;
  return _regenerator["default"].wrap(function _callee12$(_context12) {
    while (1) {
      switch (_context12.prev = _context12.next) {
        case 0:
          _context12.next = 2;
          return (0, _select["default"])("select * from users where bio=null;");

        case 2:
          results = _context12.sent;
          expect({
            abc: users.abc
          }).toEqual(results);

        case 4:
        case "end":
          return _context12.stop();
      }
    }
  }, _callee12);
})));
test("query by not null", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee13() {
  var results;
  return _regenerator["default"].wrap(function _callee13$(_context13) {
    while (1) {
      switch (_context13.prev = _context13.next) {
        case 0:
          _context13.next = 2;
          return (0, _select["default"])("select * from users where bio!=null;");

        case 2:
          results = _context13.sent;
          expect({
            def: users.def
          }).toEqual(results);

        case 4:
        case "end":
          return _context13.stop();
      }
    }
  }, _callee13);
})));