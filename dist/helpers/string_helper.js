"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var StringHelper = /*#__PURE__*/function () {
  function StringHelper() {
    (0, _classCallCheck2["default"])(this, StringHelper);
    (0, _defineProperty2["default"])(this, "stripEncasingSlashes", function (string) {
      var str = string;
      if (str === "/") return str;
      var startIndex = 0;
      var endIndex = str.length;
      if (str.indexOf("/") === 0) startIndex++;
      if (str.charAt(str.length - 1) === "/") endIndex--;
      return str.substring(startIndex, endIndex);
    });
  }

  (0, _createClass2["default"])(StringHelper, [{
    key: "regexIndexOf",
    value: function regexIndexOf(string, regex, startpos) {
      var indexOf = string.substring(startpos || 0).search(regex);
      return indexOf >= 0 ? indexOf + (startpos || 0) : indexOf;
    }
  }, {
    key: "replaceAll",
    value: function replaceAll(string, regex, replacement) {
      return string.replace(new RegExp(regex, "g"), replacement);
    }
  }, {
    key: "replaceAllIgnoreCase",
    value: function replaceAllIgnoreCase(string, regex, replacement) {
      return string.replace(new RegExp(regex, "g", "i"), replacement);
    }
  }, {
    key: "regexLastIndexOf",
    value: function regexLastIndexOf(string, regex, startpos) {
      regex = regex.global ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));

      if (typeof startpos == "undefined") {
        startpos = this.length;
      } else if (startpos < 0) {
        startpos = 0;
      }

      var stringToWorkWith = string.substring(0, startpos + 1);
      var lastIndexOf = -1;
      var nextStop = 0;

      while ((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
      }

      return lastIndexOf;
    }
  }, {
    key: "determineStringIsLike",
    value: function determineStringIsLike(val1, val2) {
      //TODO: LIKE fails on reserved regex characters (., +, etc)
      var regex = this.replaceAll(val2, "%", ".*");
      regex = this.replaceAll(regex, "_", ".{1}"); // regex= this.replaceAll(regex,'\+','\+');

      var re = new RegExp("^" + regex + "$", "g");
      return re.test(val1);
    }
  }, {
    key: "getParsedValue",
    value: function getParsedValue(stringVal, quotesMandatory) {
      if (!isNaN(stringVal)) {
        return parseFloat(stringVal);
      } else if (stringVal === "true" || stringVal === "false") {
        return stringVal === "true";
      } else if (stringVal === "null") {
        return null;
      } else if (Object.keys(SQL_FUNCTIONS).includes(stringVal.toLowerCase())) {
        return SQL_FUNCTIONS[stringVal.toLowerCase()]();
      } else if (quotesMandatory) {
        stringVal = stringVal.trim();

        if (stringVal.match(/^["|'].+["|']$/)) {
          return stringVal.replace(/["']/g, "");
        } else if (this.isMath(stringVal)) {
          return this.executeFunction(stringVal);
        } else {
          return {
            FIRESTATION_DATA_PROP: stringVal
          };
        }
      } else {
        stringVal = stringVal.trim();
        return stringVal.replace(/["']/g, "");
      }
    }
  }, {
    key: "isMath",
    value: function isMath(stringVal) {
      //TODO:
      return false || stringVal;
    }
  }, {
    key: "executeFunction",
    value: function executeFunction(stringVal) {
      TODO: return null || stringVal;
    } // users/ => users, /users => users, users => users, / => /

  }]);
  return StringHelper;
}();

var _default = new StringHelper();

exports["default"] = _default;
var SQL_FUNCTIONS = {
  "rand()": function rand() {
    return Math.random();
  }
};