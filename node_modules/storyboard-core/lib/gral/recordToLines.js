'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _timm = require('timm');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _lodash = require('../vendor/lodash');

var _ansiColors = require('./ansiColors');

var ansiColors = _interopRequireWildcard(_ansiColors);

var _constants = require('./constants');

var _filters = require('./filters');

var filters = _interopRequireWildcard(_filters);

var _serialize = require('./serialize');

var _treeLines = require('./treeLines');

var _treeLines2 = _interopRequireDefault(_treeLines);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TIME_COL_RELATIVE_LENGTH = 7;
var TIME_COL_RELATIVE_EMPTY = (0, _lodash.padStart)('', TIME_COL_RELATIVE_LENGTH);
var TIME_COL_ABSOLUTE_LENGTH = new Date().toISOString().length;
var TIME_COL_ABSOLUTE_EMPTY = (0, _lodash.padStart)('', TIME_COL_ABSOLUTE_LENGTH);

var recordToLines = function recordToLines(record, options) {
  var src = record.src,
      level = record.level,
      fStory = record.fStory,
      obj = record.obj,
      objLevel = record.objLevel,
      objOptions = record.objOptions,
      objExpanded = record.objExpanded;
  var moduleNameLength = options.moduleNameLength,
      relativeTime = options.relativeTime,
      _options$colors = options.colors,
      colors = _options$colors === undefined ? true : _options$colors;

  var out = [];

  var tmp = getTimeStr(record, options);
  var timeStr = tmp.timeStr;
  var fLongDelay = tmp.fLongDelay;

  var levelStr = ansiColors.LEVEL_NUM_TO_COLORED_STR[level];
  var msgStr = void 0;
  var actionStr = void 0;
  // let parents
  if (fStory) {
    // parents = record.parents;
    timeStr = _chalk2.default.bold(timeStr);
    var storyPrefix = void 0;
    switch (record.action) {
      case 'CREATED':
        storyPrefix = '\u250C\u2500\u2500';break;
      case 'CLOSED':
        storyPrefix = '\u2514\u2500\u2500';break;
      default:
        storyPrefix = '\u251C\u2500\u2500';break;
    }
    msgStr = _chalk2.default.bold(storyPrefix + ' ' + record.title);
    actionStr = ' [' + _chalk2.default.bold(record.action) + ']';
  } else {
    // parents = [storyId];
    msgStr = record.msg;
    actionStr = '';
  }
  // const parentsStr = _.padEnd(parents.map(o => o.slice(0,7)).join(', '), 10);
  var srcStr = ansiColors.getSrcChalkColor(src)((0, _lodash.padStart)(src, moduleNameLength));
  var objStr = '';
  var fHasObj = obj != null;
  var deserializedObj = fHasObj ? (0, _serialize.deserialize)(obj) : undefined;
  if (fHasObj && !objExpanded) {
    try {
      objStr = _chalk2.default.yellow(' -- ' + JSON.stringify(deserializedObj));
    } catch (err) {/* ignore */}
  }
  if (level >= _constants.LEVEL_STR_TO_NUM.ERROR) {
    msgStr = _chalk2.default.red.bold(msgStr);
  } else if (level >= _constants.LEVEL_STR_TO_NUM.WARN) {
    msgStr = _chalk2.default.yellow.bold(msgStr);
  }
  var finalMsg = timeStr + ' ' + srcStr + ' ' + levelStr + msgStr + actionStr + objStr;
  if (!colors) finalMsg = _chalk2.default.stripColor(finalMsg);
  out.push({ text: finalMsg, level: record.level, fLongDelay: fLongDelay });
  if (fHasObj && objExpanded && filters.passesFilter(src, objLevel)) {
    var lines = (0, _treeLines2.default)(deserializedObj, (0, _timm.merge)({ prefix: '  ' }, objOptions));
    var levelStr2 = ansiColors.LEVEL_NUM_TO_COLORED_STR[objLevel];
    var emptyTimeStr = relativeTime ? TIME_COL_RELATIVE_EMPTY : TIME_COL_ABSOLUTE_EMPTY;
    lines.forEach(function (line) {
      var text = emptyTimeStr + ' ' + srcStr + ' ' + levelStr2 + line;
      if (!colors) text = _chalk2.default.stripColor(text);
      out.push({ text: text, level: objLevel });
    });
  }
  return out;
};

var getTimeStr = function getTimeStr(record, options) {
  var relativeTime = options.relativeTime,
      prevTime = options.prevTime;

  var timeStr = '';
  var fLongDelay = void 0;
  if (relativeTime) {
    var newTime = new Date(record.t);
    var dif = prevTime ? (newTime - prevTime) / 1000 : 0;
    timeStr = dif < 1 ? dif.toFixed(3) : dif.toFixed(1);
    timeStr = (0, _lodash.padStart)(timeStr, TIME_COL_RELATIVE_LENGTH);
    fLongDelay = dif > 1;
    if (dif < 0.010) timeStr = TIME_COL_RELATIVE_EMPTY;
  } else {
    timeStr = new Date(record.t).toISOString();
  }
  return { timeStr: timeStr, fLongDelay: fLongDelay };
};

exports.default = recordToLines;