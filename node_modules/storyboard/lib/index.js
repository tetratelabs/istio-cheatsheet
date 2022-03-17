'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeAllListeners = exports.removeListener = exports.addListener = exports.getListeners = exports.config = exports.chalk = exports.mainStory = undefined;

var _storyboardCore = require('storyboard-core');

_storyboardCore.hub.init({ mainStory: _storyboardCore.mainStory }); /*!
                                                                     * Storyboard
                                                                     *
                                                                     * End-to-end, hierarchical, real-time, colorful logs and stories
                                                                     *
                                                                     * @copyright Guillermo Grau Panea 2016
                                                                     * @license MIT
                                                                     */

// Chalk is disabled by default in the browser. Override
// this default (we'll handle ANSI code conversion ourselves
// when needed)

_storyboardCore.filters.init({ mainStory: _storyboardCore.mainStory });

var config = function config() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  Object.keys(options).forEach(function (key) {
    var val = options[key];
    switch (key) {
      case 'filter':
        _storyboardCore.filters.config(val);
        break;
      case 'onChangeFilter':
        _storyboardCore.filters.setOnChangeFilter(val);
        break;
      case 'bufSize':
        _storyboardCore.hub.configure({ bufSize: val });
        break;
      /* istanbul ignore next */
      default:
        break;
    }
  });
};

var gracefulExit = function gracefulExit() {
  _storyboardCore.mainStory.close();
  _storyboardCore.hub.removeAllListeners();
};
/* istanbul ignore next */
try {
  /* eslint-disable no-undef */
  window.addEventListener('beforeunload', gracefulExit);
  /* eslint-enable no-undef */
} catch (err) {/* ignore */}
try {
  process.on('exit', gracefulExit);
} catch (err) {} /* ignore */

// -------------------------------------
// API
// -------------------------------------
var getListeners = _storyboardCore.hub.getListeners,
    addListener = _storyboardCore.hub.addListener,
    removeListener = _storyboardCore.hub.removeListener,
    removeAllListeners = _storyboardCore.hub.removeAllListeners;
exports.mainStory = _storyboardCore.mainStory;
exports.chalk = _storyboardCore.chalk;
exports.config = config;
exports.getListeners = getListeners;
exports.addListener = addListener;
exports.removeListener = removeListener;
exports.removeAllListeners = removeAllListeners;