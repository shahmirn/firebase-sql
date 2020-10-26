"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _query_parser = _interopRequireDefault(require("../query_parser"));

var _constants = require("../../constants");

var _ = require("../..");

test("clean comments", function () {
  var query = "\n    // this is a comment\n    select * from users; -- another comment\n    -- delete from users;\n    // who woulda guessed it? a comment";

  var cleaned = _query_parser["default"].formatAndCleanQuery(query);

  expect(cleaned).toBe("select * from users;");
});
test("determine statement type", function () {
  var dst = _query_parser["default"].determineStatementType; // SELECT

  expect(dst("select * from users;")).toBe(_constants.SELECT_STATEMENT);
  expect(dst("users.insert.xyz")).toBe(_constants.SELECT_STATEMENT);
  expect(dst("/")).toBe(_constants.SELECT_STATEMENT);
  expect(dst(".")).toBe(_constants.SELECT_STATEMENT); // INSERT

  expect(dst("insert into x (a) values 1;")).toBe(_constants.INSERT_STATEMENT);
  expect(dst("insert into x (a) values (select a from b);")).toBe(_constants.INSERT_STATEMENT); // UPDATE

  expect(dst("update a set b=1;")).toBe(_constants.UPDATE_STATEMENT);
  expect(dst("update a set b=(select b from a.id.b);")).toBe(_constants.UPDATE_STATEMENT); // DELETE

  expect(dst("delete from b")).toBe(_constants.DELETE_STATEMENT);
  expect(dst("delete from b where x =(select a from c)")).toBe(_constants.DELETE_STATEMENT);
});
test("get wheres", function (done) {
  var query = "select * from users\n        where age<=15\n        and height not like \"%tall\"\n        and isCool=false;";

  _query_parser["default"].getWheres(query, function (wheres) {
    //otimizeWheres will reorder the results to make an equality statement first
    expect(wheres).toEqual([{
      comparator: "==",
      field: "isCool",
      value: false
    }, {
      comparator: "!like",
      field: "height",
      value: "%tall"
    }, {
      comparator: "<=",
      field: "age",
      value: 15
    }]);
    done();
  });
});
test("get wheres - no equality check", function (done) {
  // optimize wheres detects when theres no equality check,
  // firebase will fetch entire collection
  var query = "select * from collection\n    where age<=15\n    and height not like \"%tall\";";

  _query_parser["default"].getWheres(query, function (wheres) {
    expect(wheres).toEqual([{
      error: _constants.NO_EQUALITY_STATEMENTS
    }, {
      comparator: "<=",
      field: "age",
      value: 15
    }, {
      comparator: "!like",
      field: "height",
      value: "%tall"
    }]);
    done();
  });
});
test("get sets", /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
  var query, sets;
  return _regenerator["default"].wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          query = "update users set height=10, name= \"timmy\"\n        where age<5";
          _context.next = 3;
          return _query_parser["default"].getSets(query);

        case 3:
          sets = _context.sent;
          expect(sets).toEqual({
            height: 10,
            name: "timmy"
          });

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
})));
test("get order bys", function () {
  var query = "select * from lol\n    where x < 15 and y=false\n    order by age desc, name, y DESC";

  var orderBys = _query_parser["default"].getOrderBys(query);

  expect(orderBys).toEqual([{
    propToSort: "age",
    ascending: false
  }, {
    propToSort: "name",
    ascending: true
  }, {
    propToSort: "y",
    ascending: false
  }]);
});
test("get collection", function () {
  var getCol = _query_parser["default"].getCollection; // SELECT

  expect(getCol("select * from lol;", _constants.SELECT_STATEMENT)).toBe("lol");
  expect(getCol("select * from lol/;", _constants.SELECT_STATEMENT)).toBe("lol");
  expect(getCol("select * from /lol/;", _constants.SELECT_STATEMENT)).toBe("lol");
  expect(getCol("select * from /lol;", _constants.SELECT_STATEMENT)).toBe("lol");
  expect(getCol("select * from c where age = (select a from q);", _constants.SELECT_STATEMENT)).toBe("c"); // INSERT

  expect(getCol("insert into / (a) values (1);", _constants.INSERT_STATEMENT)).toBe("/"); // UPDATE

  expect(getCol("update b.d set age = 2;", _constants.UPDATE_STATEMENT)).toBe("b/d"); // DELETE

  expect(getCol("delete from wow;", _constants.SELECT_STATEMENT)).toBe("wow");
  expect(getCol("delete from wow/;", _constants.SELECT_STATEMENT)).toBe("wow");
  expect(getCol("select * from /;", _constants.SELECT_STATEMENT)).toBe("/");
  expect(getCol("/", _constants.SELECT_STATEMENT)).toBe("/");
  expect(getCol("/;", _constants.SELECT_STATEMENT)).toBe("/");
  expect(getCol(".", _constants.SELECT_STATEMENT)).toBe("/");
  expect(getCol(".;", _constants.SELECT_STATEMENT)).toBe("/");
});
test("get selected fields", function () {
  var getSelectedFields = _query_parser["default"].getSelectedFields;
  expect(getSelectedFields("/")).toBeNull();
  expect(getSelectedFields("select * from lol;")).toBeNull();
  expect(getSelectedFields("select age from users")).toEqual({
    age: true
  });
  expect(getSelectedFields("select a, q from users")).toEqual({
    a: true,
    q: true
  });
});
test("get insert count", function () {
  var getInsertCount = _query_parser["default"].getInsertCount;
  expect(getInsertCount("insert 65 into col (a) values (1);")).toEqual(65);
});
test("get not equal index", function () {
  var getNotEqualIndex = _query_parser["default"].getNotEqualIndex;
  var where = "where a !=5";
  expect(getNotEqualIndex(where)).toEqual(where.indexOf("!="));
  where = " where a<>5 ";
  expect(getNotEqualIndex(where)).toEqual(where.indexOf("<>"));
});
test("optimize wheres", function () {
  // function looks at wheres and determines which ones firebase
  // can filter by and moves that to index 0
  var optimizeWheres = _query_parser["default"].optimizeWheres;
  var a = {
    comparator: "<=",
    field: "a",
    value: 15
  };
  var b = {
    comparator: "==",
    field: "b",
    value: 1
  }; // realtime db needs == where placed first

  expect(optimizeWheres([a, b], false)).toEqual([b, a]); // firestore is able to filter by <=, shouldn't be rearranged

  expect(optimizeWheres([a, b], true)).toEqual([a, b]); // no filterable wheres results in an error obj at index 0

  var err = {
    error: _constants.NO_EQUALITY_STATEMENTS
  };
  expect(optimizeWheres([a], false)).toEqual([err, a]);
});
test("check for cross db query", function () {
  // in case users want to query firestore when in realtime mode
  // and vice versa, ie: insert into firestore.users (select * from users);
  var isCross = _query_parser["default"].checkForCrossDbQuery;

  var _isCross = isCross("users"),
      collection = _isCross.collection,
      isFirestore = _isCross.isFirestore;

  expect(collection).toBe("users");
  expect(isFirestore).toBeFalsy();

  var _isCross2 = isCross("firestore/users"),
      col2 = _isCross2.collection,
      fs2 = _isCross2.isFirestore;

  expect(col2).toBe("users");
  expect(fs2).toBeTruthy();

  var _isCross3 = isCross("db/users"),
      col3 = _isCross3.collection,
      fs3 = _isCross3.isFirestore;

  expect(col3).toBe("users");
  expect(fs3).toBeFalsy();
  (0, _.configureFbsql)({
    isFirestore: true
  });

  var _isCross4 = isCross("users"),
      col4 = _isCross4.collection,
      fs4 = _isCross4.isFirestore;

  expect(col4).toBe("users");
  expect(fs4).toBeTruthy();

  var _isCross5 = isCross("db/users"),
      col5 = _isCross5.collection,
      fs5 = _isCross5.isFirestore;

  expect(col5).toBe("users");
  expect(fs5).toBeFalsy();
});