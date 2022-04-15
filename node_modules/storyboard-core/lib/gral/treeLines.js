'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _lodash = require('../vendor/lodash');

var _ = _interopRequireWildcard(_lodash);

var _serialize = require('./serialize');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var WRAPPER_KEY = '__SB_WRAPPER__';
var BUFFER_EXPLICIT_LIMIT = 40;

var isBuffer = function isBuffer(val) {
  return val instanceof Buffer;
};

var tree = function tree(node, options, prefix, stack) {
  var out = [];
  var _options$ignoreKeys = options.ignoreKeys,
      ignoreKeys = _options$ignoreKeys === undefined ? [] : _options$ignoreKeys;

  stack.push(node);
  var postponedArrayAttrs = [];
  var postponedObjectAttrs = [];
  var keys = Object.keys(node);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var val = node[key];
    if (ignoreKeys.indexOf(key) >= 0) {
      continue;
    }
    var finalPrefix = key === WRAPPER_KEY ? prefix : '' + prefix + key + ': ';
    if (_.isObject(val) && stack.indexOf(val) >= 0 || // Avoid circular dependencies
    val === _serialize.CIRCULAR_REF) {
      out.push(finalPrefix + _chalk2.default.green.bold('[CIRCULAR]'));
    } else if (Array.isArray(val) && val.length === 0) {
      out.push(finalPrefix + _chalk2.default.bold('[]'));
    } else if (Array.isArray(val) && val.length && _.isString(val[0])) {
      var strVal = _.map(val, function (o) {
        return '\'' + o + '\'';
      }).join(', ');
      strVal = _chalk2.default.yellow.bold('[' + strVal + ']');
      out.push(finalPrefix + strVal);
    } else if (_.isDate(val)) {
      out.push(finalPrefix + _chalk2.default.magenta.bold(val.toISOString()));
    } else if (isBuffer(val)) {
      var str = val.slice(0, BUFFER_EXPLICIT_LIMIT).toString('hex').toUpperCase().match(/(..)/g).join(' ');
      if (val.length > BUFFER_EXPLICIT_LIMIT) str += '...';
      str = 'Buffer [' + val.length + ']: ' + str;
      out.push(finalPrefix + _chalk2.default.magenta.bold(str));
    } else if (_.isObject(val) && Object.keys(val).length === 0) {
      out.push(finalPrefix + _chalk2.default.bold('{}'));
    } else if (Array.isArray(val)) {
      postponedArrayAttrs.push(key);
    } else if (_.isObject(val)) {
      postponedObjectAttrs.push(key);
    } else if (_.isString(val)) {
      var lines = val.split('\n');
      if (lines.length === 1) {
        out.push(finalPrefix + _chalk2.default.yellow.bold('\'' + val + '\''));
      } else {
        for (var m = 0, len = lines.length; m < len; m++) {
          var line = lines[m];
          out.push(finalPrefix + _chalk2.default.yellow.bold(line));
        }
      }
    } else if (val === null) {
      out.push(finalPrefix + _chalk2.default.red.bold('null'));
    } else if (val === undefined) {
      out.push(finalPrefix + _chalk2.default.bgRed.bold('undefined'));
    } else if (val === true || val === false) {
      out.push(finalPrefix + _chalk2.default.cyan.bold(val));
    } else if (_.isNumber(val)) {
      out.push(finalPrefix + _chalk2.default.blue.bold(val));
    } else {
      /* istanbul ignore next */
      out.push(finalPrefix + _chalk2.default.bold(val));
    }
  }
  for (var j = 0; j < postponedObjectAttrs.length; j++) {
    var _key = postponedObjectAttrs[j];
    var _val = node[_key];
    out.push('' + prefix + _key + ':');
    out = out.concat(tree(_val, options, options.indenter + prefix, stack));
  }
  for (var k = 0; k < postponedArrayAttrs.length; k++) {
    var _key2 = postponedArrayAttrs[k];
    var _val2 = node[_key2];
    out.push('' + prefix + _key2 + ':');
    out = out.concat(tree(_val2, options, options.indenter + prefix, stack));
  }
  stack.pop();
  return out;
};

var treeLines = function treeLines(obj0) {
  var options0 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var options = options0;
  if (options.indenter == null) options.indenter = '  ';
  var prefix = options.prefix || '';
  var obj = obj0;
  if (_.isError(obj)) {
    obj = _.pick(obj, ['name', 'message', 'stack']);
  } else if (!_.isObject(obj) || isBuffer(obj)) {
    obj = _defineProperty({}, WRAPPER_KEY, obj);
  }
  return tree(obj, options, prefix, []);
};

/* eslint-disable no-console */
treeLines.log = function () {
  var lines = treeLines.apply(undefined, arguments);
  for (var i = 0, len = lines.length; i < len; i++) {
    var line = lines[i];
    console.log(line);
  }
};
/* eslint-enable no-console */

exports.default = treeLines;