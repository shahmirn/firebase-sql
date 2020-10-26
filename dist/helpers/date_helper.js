"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatDate = formatDate;
exports.isValidDate = isValidDate;
exports.executeDateComparison = executeDateComparison;

var _moment = _interopRequireDefault(require("moment"));

function formatDate(dateString) {
  var date = new Date(dateString);
  var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();
  return day + "-" + monthNames[monthIndex] + "-" + year;
}

function isValidDate(dateString) {
  return (0, _moment["default"])(dateString).isValid;
}

function executeDateComparison(val1, val2, comparator) {
  var m1 = (0, _moment["default"])(val1);
  var m2 = (0, _moment["default"])(val2);
  var diff = m1.diff(m2);

  switch (comparator) {
    case "<=":
      return diff <= 0;

    case ">=":
      return diff >= 0;

    case ">":
      return diff > 0;

    case "<":
      return diff < 0;
  }
}