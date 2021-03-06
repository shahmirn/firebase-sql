import { getApp } from "../index";
import stringHelper from "../helpers/string_helper";
import { isValidDate, executeDateComparison } from "../helpers/date_helper";
import QueryDetails from "../models/fbSqlQuery";

const getDataForSelectAsync = query => {
  query.shouldApplyListener = false;
  return new Promise((resolve, reject) => {
    getDataForSelect(query, res => {
      resolve(res);
    });
  });
};

const getDataForSelect = function(query, callback) {
  const { wheres, selectedFields, isFirestore } = query;
  const app = getApp();
  let db = isFirestore ? app.firestore() : app.database();
  //TODO: reimplement listeners, using firestore listeners as well
  let results = {
    statementType: "SELECT_STATEMENT",
    path: query.collection,
    orderBys: query.orderBys,
    payload: {},
    isFirestore
  };
  if (
    !wheres ||
    (wheres[0] && wheres[0] && wheres[0].error === "NO_EQUALITY_STATEMENTS")
  ) {
    //unfilterable query, grab whole collection
    const collectionCallback = res => {
      if (wheres && wheres[0]) {
        res.payload = filterWheresAndNonSelectedFields(
          res.payload,
          wheres,
          selectedFields
        );
        // results.firebaseListener = ref;
      }
      return callback(res);
    };
    query.isFirestore
      ? unfilteredFirestoreQuery(db, results, query, collectionCallback)
      : queryEntireRealtimeCollection(db, results, query, collectionCallback);
  } else {
    //filterable query
    query.isFirestore
      ? executeFilteredFirestoreQuery(db, results, query, callback)
      : executeFilteredRealtimeQuery(db, results, query, callback);
  }
};

const unfilteredFirestoreQuery = function(db, results, query, callback) {
  const { collection, selectedFields, shouldApplyListener } = query;
  if (collection === "/") {
    //root query: select * from /;
    // TODO: Listener
    db.getCollections()
      .then(collections => {
        if (collections.length === 0) {
          // no collections
          results.payload = null;
          return callback(results);
        }
        let numDone = 0;
        let firestoreData = {};
        collections.forEach(collection => {
          let colId = collection.id;
          let query = new QueryDetails();
          query.collection = colId;
          unfilteredFirestoreQuery(db, { payload: {} }, query, res => {
            firestoreData[colId] = res.payload;
            if (++numDone >= collections.length) {
              results.payload = firestoreData;
              return callback(results);
            }
          });
        });
      })
      .catch(err => {
        console.log("Err getting cols:", err);
        results.error = err.message;
        return callback(results);
      });
  } else if (collection.includes("/")) {
    let [col, docId, ...propPath] = collection.split(`/`);
    // users.userId.age => col: users, docId:userId, propPath: [age]
    docId = stringHelper.replaceAll(docId, "/", ".");
    const ref = db.collection(col).doc(docId);
    const fetchData = shouldApplyListener
      ? listenToFirestoreDoc
      : getFirstoreDocOnce;

    fetchData(
      ref,
      ({ docData, unsub }) => {
        if (!docData) {
          results.error = { message: "No such document" };
          return callback(results);
        }
        results.payload =
          propPath.length > 0 ? getDataAtPropPath(docData, propPath) : docData;
        results = removeFieldsAndApplyUnsub(results, selectedFields, {
          type: "firestore",
          unsub
        });

        return callback(results);
      },
      err => {
        results.error = { message: "No such document" };
        return callback(results);
      }
    );
  } else {
    //select * from collection
    const fetchData = shouldApplyListener
      ? listenToFirestoreCol
      : getFirstoreColOnce;

    fetchData(
      db.collection(collection),
      ({ data, unsub }) => {
        results.payload = data;
        results = removeFieldsAndApplyUnsub(results, selectedFields, {
          type: "firestore",
          unsub
        });
        return callback(results);
      },
      err => {
        results.error = err.message;
        return callback(results);
      }
    );
  }
};

const removeFieldsAndApplyUnsub = (
  results,
  selectedFields,
  { type, unsub }
) => {
  if (selectedFields) {
    results.payload = removeNonSelectedFieldsFromResults(
      results.payload,
      selectedFields
    );
  }
  if (type && unsub) {
    results.firebaseListener = {
      type,
      unsubscribe: () => unsub()
    };
  }
  return results;
};

const getDataAtPropPath = (data, propPath = []) => {
  let propData;
  propPath.forEach(prop => {
    let subData = data[prop];
    if (!subData) return null;
    propData = subData;
  });
  return propData;
};

const getFirstoreDocOnce = (ref, callback, onErr) => {
  ref
    .get()
    .then(doc => callback({ docData: doc.exists ? doc.data() : null }))
    .catch(onErr);
};

const listenToFirestoreDoc = (ref, callback, onErr) => {
  let unsub = ref.onSnapshot(doc =>
    callback({ docData: doc.exists ? doc.data() : null, unsub }, onErr)
  );
};

const getFirstoreColOnce = (ref, callback, onErr) => {
  ref
    .get()
    .then(snapshot => {
      let data = {};
      snapshot.forEach(doc => {
        data[doc.id] = doc.data();
      });
      return callback({ data });
    })
    .catch(onErr);
};

const listenToFirestoreCol = (ref, callback, onErr) => {
  let unsub = ref.onSnapshot(snapshot => {
    let data = {};
    snapshot.forEach(doc => {
      data[doc.id] = doc.data();
    });
    return callback({ data, unsub });
  }, onErr);
};

const queryEntireRealtimeCollection = function(db, results, query, callback) {
  const { collection, selectedFields, shouldApplyListener } = query;
  const ref = db.ref(collection);
  const queryCallback = snapshot => {
    results.payload = snapshot.val();
    if (selectedFields) {
      results.payload = removeNonSelectedFieldsFromResults(
        results.payload,
        selectedFields
      );
    }
    results.firebaseListener = shouldApplyListener
      ? {
          unsubscribe: () => ref.off("value"),
          type: "realtime"
        }
      : null;
    return callback(results);
  };

  shouldApplyListener
    ? ref.on("value", queryCallback)
    : ref.once("value").then(queryCallback);
};

const executeFilteredFirestoreQuery = function(db, results, query, callback) {
  const { collection, selectedFields, wheres, shouldApplyListener } = query;
  const mainWhere = wheres[0];
  // TODO: where chaining if we have multiple filterable, rather than client side filter
  // ie: citiesRef.where("state", "==", "CO").where("name", "==", "Denver")
  // TODO: promise version
  let unsub = db
    .collection(collection)
    .where(mainWhere.field, mainWhere.comparator, mainWhere.value)
    .onSnapshot(
      snapshot => {
        let payload = {};
        snapshot.forEach(doc => {
          payload[doc.id] = doc.data();
        });
        payload = filterWheresAndNonSelectedFields(
          payload,
          wheres,
          selectedFields
        );
        results.payload = payload;
        results.firebaseListener = {
          type: "firestore",
          unsubscribe: () => unsub()
        };
        callback(results);
      },
      err => {
        results.error = err.message;
        return callback(results);
      }
    );
};

const executeFilteredRealtimeQuery = function(db, results, query, callback) {
  const { collection, selectedFields, wheres, shouldApplyListener } = query;
  const mainWhere = wheres[0];
  const ref = db
    .ref(collection)
    .orderByChild(mainWhere.field)
    .equalTo(mainWhere.value);

  const resCallback = snapshot => {
    results.payload = filterWheresAndNonSelectedFields(
      snapshot.val(),
      wheres,
      selectedFields
    );
    results.firebaseListener = shouldApplyListener
      ? {
          unsubscribe: () => ref.off("value"),
          type: "realtime"
        }
      : null;
    return callback(results);
  };

  shouldApplyListener
    ? ref.on("value", resCallback)
    : ref.once("value").then(resCallback);
};

const filterWheresAndNonSelectedFields = function(
  resultsPayload,
  wheres,
  selectedFields
) {
  if (wheres.length > 1) {
    resultsPayload = filterResultsByWhereStatements(
      resultsPayload,
      wheres.slice(1)
    );
  }
  if (selectedFields) {
    resultsPayload = removeNonSelectedFieldsFromResults(
      resultsPayload,
      selectedFields
    );
  }
  return resultsPayload;
};

const removeNonSelectedFieldsFromResults = (results, selectedFields) => {
  if (!results || !selectedFields) {
    return results;
  }
  Object.keys(results).forEach(objKey => {
    if (typeof results[objKey] !== "object") {
      if (!selectedFields[objKey]) {
        delete results[objKey];
      }
    } else {
      Object.keys(results[objKey]).forEach(propKey => {
        if (!selectedFields[propKey]) {
          delete results[objKey][propKey];
        }
      });
    }
  });
  return Object.keys(results).length === 1
    ? results[Object.keys(results)[0]]
    : results;
};

const filterResultsByWhereStatements = (results, whereStatements) => {
  if (!results) {
    return null;
  }
  let returnedResults = {};
  let nonMatch = {};
  for (let i = 0; i < whereStatements.length; i++) {
    let where = whereStatements[i];
    Object.keys(results).forEach(key => {
      let thisResult = results[key][where.field];
      if (!conditionIsTrue(thisResult, where.value, where.comparator)) {
        nonMatch[key] = results[key];
      }
    });
  }
  if (nonMatch) {
    Object.keys(results).forEach(key => {
      if (!nonMatch[key]) {
        returnedResults[key] = results[key];
      }
    });
    return returnedResults;
  } else {
    return results;
  }
};

const conditionIsTrue = (val1, val2, comparator) => {
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
      return stringHelper.determineStringIsLike(val1, val2);
    case "!like":
      return !stringHelper.determineStringIsLike(val1, val2);
    default:
      throw "Unrecognized comparator: " + comparator;
  }
};

const determineEquals = (val1, val2) => {
  val1 = typeof val1 == "undefined" || val1 == "null" ? null : val1;
  val2 = typeof val2 == "undefined" || val2 == "null" ? null : val2;
  return val1 === val2;
};

const determineGreaterOrLess = (val1, val2, comparator) => {
  let isNum = false;
  if (isNaN(val1) || isNaN(val2)) {
    if (isValidDate(val1) && isValidDate(val2)) {
      return executeDateComparison(val1, val2, comparator);
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

export { getDataForSelect, getDataForSelectAsync, unfilteredFirestoreQuery };
