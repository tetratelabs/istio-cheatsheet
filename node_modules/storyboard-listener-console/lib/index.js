'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _timm = require('timm');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var REQUIRED_CORE_VERSION = '^3.0.0-rc.2';

/* eslint-disable no-undef */
var IS_BROWSER = typeof window !== 'undefined' && window !== null || process.env.TEST_BROWSER != null;
/* eslint-enable no-undef */

var DEFAULT_CONFIG = {
  moduleNameLength: 20,
  relativeTime: IS_BROWSER,
  colors: true,
  useStderr: false
};

// -----------------------------------------
// Listener
// -----------------------------------------

var ConsoleListener = function () {
  function ConsoleListener(config, _ref) {
    var hub = _ref.hub,
        ansiColors = _ref.ansiColors,
        recordToLines = _ref.recordToLines;

    _classCallCheck(this, ConsoleListener);

    this.type = 'CONSOLE';
    this.config = config;
    this.hub = hub;
    this.hubId = hub.getHubId();
    this.ansiColors = ansiColors;
    this.recordToLines = recordToLines;
    this.prevTime = 0;
  }

  _createClass(ConsoleListener, [{
    key: 'configure',
    value: function configure(config) {
      this.config = (0, _timm.merge)(this.config, config);
    }
  }, {
    key: 'getConfig',
    value: function getConfig() {
      return this.config;
    }

    // No init() or tearDown() is required

    // -----------------------------------------
    // Main processing function
    // -----------------------------------------

  }, {
    key: 'process',
    value: function process(msg) {
      var _this = this;

      if (msg.type !== 'RECORDS') return;
      if (msg.hubId !== this.hubId) return; // only log local records
      msg.data.forEach(function (record) {
        return _this.processRecord(record);
      });
    }
  }, {
    key: 'processRecord',
    value: function processRecord(record) {
      var _this2 = this;

      var options = (0, _timm.set)(this.config, 'prevTime', this.prevTime);
      var lines = this.recordToLines(record, options);
      this.prevTime = new Date(record.t);
      lines.forEach(function (_ref2) {
        var text = _ref2.text,
            level = _ref2.level,
            fLongDelay = _ref2.fLongDelay;
        return _this2.outputLog(text, level, fLongDelay);
      });
    }

    // -----------------------------------------
    // Helpers
    // -----------------------------------------
    /* eslint-disable no-console, prefer-spread */

  }, {
    key: 'outputLog',
    value: function outputLog(text, level, fLongDelay) {
      var args = IS_BROWSER ? this.ansiColors.getBrowserConsoleArgs(text) : [text];
      if (fLongDelay) console.log('          ...');
      if (IS_BROWSER) {
        switch (level) {
          case 40:
            console.warn.apply(console, args);
            break;
          case 50:
          case 60:
            console.error.apply(console, args);
            break;
          default:
            console.log.apply(console, args);
            break;
        }
      } else {
        /* eslint-disable no-lonely-if */
        if (this.config.useStderr && level >= 50) {
          console.error.apply(console, args);
        } else {
          console.log.apply(console, args);
        }
        /* eslint-enable no-lonely-if */
      }
    }
    /* eslint-enable no-console */

  }]);

  return ConsoleListener;
}();

// -----------------------------------------
// API
// -----------------------------------------


var create = function create(userConfig, context) {
  return new ConsoleListener((0, _timm.addDefaults)(userConfig, DEFAULT_CONFIG), context);
};
create.requiredCoreVersion = REQUIRED_CORE_VERSION;

exports.default = create;