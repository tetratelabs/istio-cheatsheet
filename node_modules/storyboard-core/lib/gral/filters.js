'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.passesFilter = exports.setOnChangeFilter = exports.getConfig = exports.config = exports.init = undefined;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var included = null;
var excluded = null;
var cachedThreshold = null;
var mainStory = null;
var onChangeFilter = null;

var init = function init(deps) {
  mainStory = deps.mainStory;
  /* istanbul ignore if */
  if (!mainStory) throw new Error('MISSING_DEPENDENCIES');
  mainStory.info('storyboard', 'Log filter: ' + _chalk2.default.cyan.bold(getConfig()));
};

var setUpFilters = function setUpFilters() {
  included = [];
  excluded = [];
  cachedThreshold = {};
  var filter = getConfig();
  var specs = filter.split(/[\s,]+/);
  specs.forEach(function (spec) {
    if (!spec.length) return;
    var tokens = spec.split(':');
    var src = tokens[0].replace(/\*/g, '.*?');
    var level = tokens[1];
    if (src[0] === '-') {
      excluded.push({ re: new RegExp('^' + src.substr(1) + '$') });
    } else {
      if (tokens.length < 1) {
        mainStory.error('storyboard', 'Incorrect filter element: ' + _chalk2.default.cyan.bold(spec));
        return;
      }
      level = level.toUpperCase();
      if (level === '*') level = 'TRACE';
      var threshold = _constants.LEVEL_STR_TO_NUM[level];
      if (threshold == null) threshold = _constants.LEVEL_STR_TO_NUM.DEBUG;
      included.push({ re: new RegExp('^' + src + '$'), threshold: threshold });
    }
  });
};

var getStorage = function getStorage() {
  if (typeof window === 'undefined') return process.env;
  try {
    /* eslint-disable no-undef */
    return window && window.localStorage ? window.localStorage : {};
    /* eslint-enable no-undef */
  } catch (err) {
    return {}; // no storage available
  }
};

var getConfig = function getConfig() {
  var store = getStorage();
  var filter = store[_constants.FILTER_KEY];
  if (filter == null || !filter.length) filter = _constants.DEFAULT_FILTER;
  return filter;
};

var config = function config(filter) {
  var store = getStorage();
  store[_constants.FILTER_KEY] = filter || '';
  cachedThreshold = null;
  setUpFilters();
  var newFilter = getConfig();
  if (onChangeFilter) onChangeFilter(newFilter);
  mainStory.info('storyboard', 'Log filter is now: ' + _chalk2.default.cyan.bold(newFilter));
};

var setOnChangeFilter = function setOnChangeFilter(fn) {
  onChangeFilter = fn;
};

var calcThreshold = function calcThreshold(src) {
  for (var i = 0; i < excluded.length; i++) {
    if (excluded[i].re.test(src)) return null;
  }
  for (var _i = 0; _i < included.length; _i++) {
    if (included[_i].re.test(src)) return included[_i].threshold;
  }
  return null;
};

/* eslint-disable no-prototype-builtins */
var passesFilter = function passesFilter(src, level) {
  var thresh = void 0;
  if (cachedThreshold.hasOwnProperty(src)) {
    thresh = cachedThreshold[src];
  } else {
    cachedThreshold[src] = calcThreshold(src);
    thresh = cachedThreshold[src];
  }
  return thresh != null && level >= thresh;
};
/* eslint-enable no-prototype-builtins */

setUpFilters();

// -----------------------------------------
// API
// -----------------------------------------
exports.init = init;
exports.config = config;
exports.getConfig = getConfig;
exports.setOnChangeFilter = setOnChangeFilter;
exports.passesFilter = passesFilter;