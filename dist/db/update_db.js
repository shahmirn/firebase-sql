"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateFields = exports.pushObject = exports.setObjectProperty = exports.set = exports.deleteObject = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _string_helper = _interopRequireDefault(require("../helpers/string_helper"));

var _index = require("../index");

var updateFields = function updateFields(path, object, fields, isFirestore) {
  if (!fields || !object) {
    return;
  } // const app = startFirebaseApp(savedDatabase);


  var app = (0, _index.getApp)();
  return isFirestore ? updateFirestoreFields(app.firestore(), path, object, fields) : updateRealtimeFields(app.database(), path, object, fields);
};

exports.updateFields = updateFields;

var updateRealtimeFields = function updateRealtimeFields(db, path, newData, fields) {
  var updateObject = {};
  fields.forEach(function (field) {
    updateObject[field] = newData[field];
  });
  return db.ref(path).update(updateObject);
};

var updateFirestoreFields = function updateFirestoreFields(db, path, object, fields) {
  var _path$split = path.split(/\/(.+)/),
      _path$split2 = (0, _slicedToArray2["default"])(_path$split, 2),
      col = _path$split2[0],
      doc = _path$split2[1]; // splits only on first '/' char


  return db.collection(col).doc(doc).set(object);
};

var deleteObject = function deleteObject(path, isFirestore) {
  var app = (0, _index.getApp)();
  return isFirestore ? deleteFirestoreData(app.firestore(), path) : app.database().ref(path).remove();
};

exports.deleteObject = deleteObject;

var deleteFirestoreData = function deleteFirestoreData(db, path) {
  var _path$split3 = path.split(/\/(.+)/),
      _path$split4 = (0, _slicedToArray2["default"])(_path$split3, 2),
      collection = _path$split4[0],
      doc = _path$split4[1]; //splits on first "/"


  return doc.includes("/") ? deleteFirestoreField(db, collection, doc) : deleteFirestoreDoc(db, collection, doc);
};

var deleteFirestoreDoc = function deleteFirestoreDoc(db, collection, doc) {
  return db.collection(collection).doc(doc)["delete"]();
};

var deleteFirestoreField = function deleteFirestoreField(db, collection, docAndField) {
  var _docAndField$split = docAndField.split(/\/(.+)/),
      _docAndField$split2 = (0, _slicedToArray2["default"])(_docAndField$split, 2),
      doc = _docAndField$split2[0],
      field = _docAndField$split2[1];

  field = _string_helper["default"].replaceAll(field, "/", ".");
  return db.collection(collection).doc(doc).update((0, _defineProperty2["default"])({}, field, (0, _index.getApp)().firestore.FieldValue["delete"]()));
};

var pushObject = function pushObject(path, object, isFirestore) {
  var app = (0, _index.getApp)();
  return isFirestore ? createFirestoreDocument(app.firestore(), path, object) : app.database().ref(path).push(object);
};

exports.pushObject = pushObject;

var createFirestoreDocument = function createFirestoreDocument(db, path, data) {
  var _path$split5 = path.split(/\/(.+)/),
      _path$split6 = (0, _slicedToArray2["default"])(_path$split5, 2),
      collection = _path$split6[0],
      docId = _path$split6[1];

  return docId ? setFirestoreDocWithExplicitId(db, collection, docId, data) : pushFirestoreDocToGeneratedId(db, collection, data);
};

var setFirestoreDocWithExplicitId = function setFirestoreDocWithExplicitId(db, collection, docId, data) {
  return db.collection(collection).doc(docId).set(data);
};

var pushFirestoreDocToGeneratedId = function pushFirestoreDocToGeneratedId(db, collection, data) {
  collection = collection.replace(/\/+$/, ""); //remove trailing "/"

  return db.collection(collection).add(data);
};

var set = function set(savedDatabase, path, data, isFirestore) {
  var app = (0, _index.getApp)();
  var db = isFirestore ? app.firestore() : app.database();

  if (isFirestore) {
    var _path$split7 = path.split(/\/(.+)/),
        _path$split8 = (0, _slicedToArray2["default"])(_path$split7, 2),
        collection = _path$split8[0],
        docId = _path$split8[1];

    docId.includes("/") ? setFirestoreProp(db, path, data) : setFirestoreDocWithExplicitId(db, collection, docId, data);
  } else {
    db.ref(path).set(data);
  }
};

exports.set = set;

var setObjectProperty = function setObjectProperty(savedDatabase, path, value, isFirestore) {
  var app = (0, _index.getApp)();
  value = _string_helper["default"].getParsedValue(value);
  isFirestore ? setFirestoreProp(app.firestore(), path, value) : app.database().ref(path).set(value);
};

exports.setObjectProperty = setObjectProperty;

var setFirestoreProp = function setFirestoreProp(db, path, value) {
  path = path.charAt(0) === "/" && path.length > 1 ? path.substring(1) : path;
  path = _string_helper["default"].replaceAll(path, "/", ".");

  var _path$split9 = path.split(/\.(.+)/),
      _path$split10 = (0, _slicedToArray2["default"])(_path$split9, 2),
      collection = _path$split10[0],
      docAndField = _path$split10[1];

  var _docAndField$split3 = docAndField.split(/\.(.+)/),
      _docAndField$split4 = (0, _slicedToArray2["default"])(_docAndField$split3, 2),
      docId = _docAndField$split4[0],
      field = _docAndField$split4[1];

  if (!field) {
    //trying to create a new doc from obj tree
    return createFirestoreDocument(db, collection, (0, _defineProperty2["default"])({}, docId, value));
  }

  db.collection(collection).doc(docId).update((0, _defineProperty2["default"])({}, field, value));
};