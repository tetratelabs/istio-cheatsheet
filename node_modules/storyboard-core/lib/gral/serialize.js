'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.STORYBOARD_TYPE_ATTR = exports.CIRCULAR_REF = exports.deserialize = exports.serialize = undefined;

var _timm = require('timm');

var _lodash = require('../vendor/lodash');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var CIRCULAR_REF = '__SB_CIRCULAR__';
var STORYBOARD_TYPE_ATTR = '__SB_TYPE__';

// -------------------------------------
// Main
// -------------------------------------
var serialize = function serialize(obj) {
  return doSerialize(obj, []);
};
var deserialize = function deserialize(obj) {
  return doDeserialize(obj);
};

// -------------------------------------
// Helpers
// -------------------------------------
var doSerialize = function doSerialize(obj, stack) {
  if (obj === undefined) return _defineProperty({}, STORYBOARD_TYPE_ATTR, 'UNDEFINED');
  if (!(0, _lodash.isObject)(obj)) return obj;

  // Handle circular references (using `stack`)
  if (stack.indexOf(obj) >= 0) return CIRCULAR_REF;
  stack.push(obj);
  var out = void 0;

  // Handle special cases
  if ((0, _lodash.isError)(obj)) {
    var _out;

    var name = obj.name,
        message = obj.message,
        errorStack = obj.stack;

    out = (_out = {}, _defineProperty(_out, STORYBOARD_TYPE_ATTR, 'ERROR'), _defineProperty(_out, 'name', name), _defineProperty(_out, 'message', message), _defineProperty(_out, 'stack', errorStack), _out);
  } else if (obj instanceof Date) {
    out = new Date(obj);
  } else if (obj instanceof Buffer) {
    var _out2;

    out = (_out2 = {}, _defineProperty(_out2, STORYBOARD_TYPE_ATTR, 'BUFFER'), _defineProperty(_out2, 'data', Array.from(obj)), _out2);

    // Handle arrays
  } else if (Array.isArray(obj)) {
    out = obj.map(function (el) {
      return doSerialize(el, stack);
    });

    // Handle objects
  } else {
    out = {};
    Object.keys(obj).forEach(function (key) {
      out[key] = doSerialize(obj[key], stack);
    });
  }
  stack.pop();
  return out;
};

var doDeserialize = function doDeserialize(obj) {
  if (!(0, _lodash.isObject)(obj)) return obj;
  var out = void 0;
  if (Array.isArray(obj)) {
    out = obj.map(function (el) {
      return doDeserialize(el);
    });
  } else if (obj instanceof Date) {
    out = new Date(obj);
  } else {
    switch (obj[STORYBOARD_TYPE_ATTR]) {
      case 'UNDEFINED':
        out = undefined;
        break;
      case 'ERROR':
        out = (0, _timm.omit)(obj, STORYBOARD_TYPE_ATTR);
        break;
      case 'BUFFER':
        out = Buffer.from(obj.data);
        break;
      default:
        out = {};
        Object.keys(obj).forEach(function (key) {
          out[key] = doDeserialize(obj[key]);
        });
        break;
    }
  }
  return out;
};

// -------------------------------------
// API
// -------------------------------------
exports.serialize = serialize;
exports.deserialize = deserialize;
exports.CIRCULAR_REF = CIRCULAR_REF;
exports.STORYBOARD_TYPE_ATTR = STORYBOARD_TYPE_ATTR;