'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/* eslint-disable no-undef */
var IS_BROWSER = exports.IS_BROWSER = typeof window !== 'undefined' && window !== null || process.env.TEST_BROWSER != null;
/* eslint-enable no-undef */
var LEVEL_NUM_TO_STR = exports.LEVEL_NUM_TO_STR = {
  10: 'TRACE',
  20: 'DEBUG',
  30: 'INFO',
  40: 'WARN',
  50: 'ERROR',
  60: 'FATAL'
};
var LEVEL_STR_TO_NUM = exports.LEVEL_STR_TO_NUM = {
  TRACE: 10,
  DEBUG: 20,
  INFO: 30,
  WARN: 40,
  ERROR: 50,
  FATAL: 60
};

// WebSockets
var WS_NAMESPACE = exports.WS_NAMESPACE = '/STORYBOARD';

// Filters
var FILTER_KEY = exports.FILTER_KEY = 'STORYBOARD';
var DEFAULT_FILTER = exports.DEFAULT_FILTER = '*:DEBUG';