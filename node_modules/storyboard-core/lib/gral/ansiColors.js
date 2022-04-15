'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStyledSegments = exports.getBrowserConsoleArgs = exports.getSrcChalkColor = exports.LEVEL_NUM_TO_COLORED_STR = undefined;

var _timm = require('timm');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _lodash = require('../vendor/lodash');

var _ = _interopRequireWildcard(_lodash);

var _constants = require('./constants');

var k = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// We must ensure that `chalk` is enabled already; otherwise,
// all of the following constant definitions will be monochrome
_chalk2.default.enabled = true;

// -------------------------------------------------
// Map severity level to a colored string
// -------------------------------------------------
var LEVEL_NUM_TO_COLORED_STR = {};

Object.keys(k.LEVEL_NUM_TO_STR).forEach(function (key) {
  var num = Number(key);
  var str = k.LEVEL_NUM_TO_STR[key];
  var col = _chalk2.default.grey;
  if (num === 30) {
    col = k.IS_BROWSER ? _chalk2.default.bold : _chalk2.default.white;
  } else if (num === 40) {
    col = _chalk2.default.yellow;
  } else if (num >= 50) {
    col = _chalk2.default.red;
  }
  LEVEL_NUM_TO_COLORED_STR[num] = col(_.padEnd(str, 6));
});

// -------------------------------------------------
// Get a color for a given src (cached)
// -------------------------------------------------
var COLORS = [];
var BASE_COLORS = ['cyan', 'yellow', 'red', 'green', 'blue', 'magenta'];
BASE_COLORS.forEach(function (col) {
  COLORS.push(_chalk2.default[col].bold);
});
BASE_COLORS.forEach(function (col) {
  COLORS.push(_chalk2.default[col]);
});
var NUM_COLORS = COLORS.length;

var srcColorCache = {};
var _srcCnt = 0;

/* eslint-disable no-plusplus */
var getSrcChalkColor = function getSrcChalkColor(src) {
  if (srcColorCache[src] == null) {
    srcColorCache[src] = COLORS[_srcCnt++ % NUM_COLORS];
  }
  return srcColorCache[src];
};
/* eslint-enable no-plusplus */

// -------------------------------------------------
// Convert ANSI codes to console args and styled segments
// -------------------------------------------------
/* eslint-disable max-len */
var ANSI_REGEX = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/g;
/* eslint-enable max-len */
var ANSI_ADD = {
  1: 'BOLD',
  2: 'DIM',
  3: 'ITALIC',
  4: 'UNDERLINE',
  7: 'INVERSE',
  8: 'HIDDEN',
  9: 'STRIKETHROUGH'
};
var ANSI_ADD_COLOR = {
  30: 'BLACK',
  31: 'RED',
  32: 'GREEN',
  33: 'YELLOW',
  34: 'BLUE',
  94: 'BLUE',
  35: 'MAGENTA',
  36: 'CYAN',
  37: 'WHITE',
  90: 'GREY'
};
var ANSI_ADD_BGCOLOR = {
  40: 'BLACK',
  41: 'RED',
  42: 'GREEN',
  43: 'YELLOW',
  44: 'BLUE',
  45: 'MAGENTA',
  46: 'CYAN',
  47: 'WHITE'
};
var ANSI_REMOVE = {
  // 0, 39, 49: handled manually
  21: ['BOLD'],
  22: ['BOLD', 'DIM'],
  23: ['ITALIC'],
  24: ['UNDERLINE'],
  27: ['INVERSE'],
  28: ['HIDDEN'],
  29: ['STRIKETHROUGH']
};
var CSS_COLORS = {
  BLACK: 'black',
  RED: '#cc0000',
  GREEN: 'green',
  YELLOW: '#ff6600',
  BLUE: 'blue',
  MAGENTA: 'magenta',
  CYAN: 'darkturquoise',
  WHITE: 'lightgrey',
  GREY: 'grey'
};
var CSS_STYLES = {
  BOLD: 'font-weight: bold',
  DIM: 'opacity: 0.8',
  ITALIC: 'font-style: italic',
  UNDERLINE: 'text-decoration: underline',
  INVERSE: '',
  HIDDEN: 'display: none',
  STRIKETHROUGH: 'text-decoration: line-through'
};
var REACT_STYLES = {
  BOLD: { fontWeight: 'bold' },
  DIM: { opacity: 0.8 },
  ITALIC: { fontStyle: 'italic' },
  UNDERLINE: { textDecoration: 'underline' },
  INVERSE: {},
  HIDDEN: { display: 'none' },
  STRIKETHROUGH: { textDecoration: 'line-through' }
};

var getBrowserConsoleArgs = function getBrowserConsoleArgs(str) {
  var outStr = str.replace(ANSI_REGEX, '%c');
  var argArray = [outStr];
  var curStyles = {};
  var regex = /\u001b\[(\d+)*m/gi;
  var res = void 0;
  while (res = regex.exec(str)) {
    curStyles = updateStyles(curStyles, Number(res[1]));
    argArray.push(toConsoleArgs(curStyles));
  }
  return argArray;
};

var getStyledSegments = function getStyledSegments(str) {
  var out = [];
  if (!_.isString(str)) return out;
  var tokens = str.split(/\u001b\[(\d+)*m/gi);
  var curStyles = {};
  var text = tokens[0];
  if (text.length) out.push({ text: text, style: {} });
  for (var idx = 1; idx < tokens.length; idx += 2) {
    curStyles = updateStyles(curStyles, Number(tokens[idx]));
    text = tokens[idx + 1];
    if (!text.length) continue;
    out.push({ text: text, style: toSegmentStyle(curStyles) });
  }
  return out;
};

/* eslint-disable no-param-reassign */
var updateStyles = function updateStyles(curStyles, code) {
  var style = void 0;
  var color = void 0;
  var bgColor = void 0;
  var removeStyles = void 0;
  if (style = ANSI_ADD[code]) {
    curStyles[style] = true;
  } else if (color = ANSI_ADD_COLOR[code]) {
    curStyles.color = color;
  } else if (bgColor = ANSI_ADD_BGCOLOR[code]) {
    curStyles.bgColor = bgColor;
  } else if (code === 39) {
    curStyles.color = undefined;
  } else if (code === 49) {
    curStyles.bgColor = undefined;
  } else if (removeStyles = ANSI_REMOVE[code]) {
    for (var i = 0; i < removeStyles.length; i++) {
      style = removeStyles[i];
      curStyles[style] = undefined;
    }
  } else if (code === 0) {
    curStyles = {};
  }
  return curStyles;
};
/* eslint-enable no-param-reassign */

var toConsoleArgs = function toConsoleArgs(styles) {
  var out = [];
  Object.keys(styles).forEach(function (key) {
    var val = styles[key];
    if (val == null) return;
    switch (key) {
      case 'color':
        out.push('color: ' + CSS_COLORS[val]);
        break;
      case 'bgColor':
        out.push('color: white; background-color: ' + CSS_COLORS[val]);
        break;
      default:
        out.push(CSS_STYLES[key]);
    }
  });
  return out.join(';');
};

var toSegmentStyle = function toSegmentStyle(styles) {
  var out = {};
  Object.keys(styles).forEach(function (key) {
    var val = styles[key];
    if (val == null) return;
    switch (key) {
      case 'color':
        out.color = CSS_COLORS[val];
        break;
      case 'bgColor':
        out.color = 'white';
        out.backgroundColor = CSS_COLORS[val];
        break;
      default:
        out = (0, _timm.merge)(out, REACT_STYLES[key]);
    }
  });
  return out;
};

// -------------------------------------------------
// Public API
// -------------------------------------------------
exports.LEVEL_NUM_TO_COLORED_STR = LEVEL_NUM_TO_COLORED_STR;
exports.getSrcChalkColor = getSrcChalkColor;
exports.getBrowserConsoleArgs = getBrowserConsoleArgs;
exports.getStyledSegments = getStyledSegments;