'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBufferedRecords = exports.getBufferedMessages = exports.emitMsg = exports.emitMsgWithFields = exports.removeAllListeners = exports.removeListener = exports.addListener = exports.getListeners = exports.configure = exports.getHubId = exports.init = undefined;

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _timm = require('timm');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _filters = require('./filters');

var filters = _interopRequireWildcard(_filters);

var _ansiColors = require('./ansiColors');

var ansiColors = _interopRequireWildcard(_ansiColors);

var _recordToLines = require('./recordToLines');

var _recordToLines2 = _interopRequireDefault(_recordToLines);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var coreVersion = require('../../package.json').version;

var DEFAULT_CONFIG = {
  bufMsgSize: 1000,
  bufSize: 1000
};

// -------------------------------------
// Init and config
// -------------------------------------
var mainStory = null;
var config = DEFAULT_CONFIG;
var hubId = _uuid2.default.v4();

var init = function init(deps, options) {
  mainStory = deps.mainStory;
  /* istanbul ignore if */
  if (!mainStory) throw new Error('MISSING_DEPENDENCIES');
  /* istanbul ignore if */
  if (options != null) configure(options);
};

var getHubId = function getHubId() {
  return hubId;
};
var configure = function configure(options) {
  config = (0, _timm.merge)(config, options);
};

// -------------------------------------
// Managing listeners
// -------------------------------------
var listeners = [];

var getListeners = function getListeners() {
  return listeners;
};

var addListener = function addListener(listenerCreate) {
  var userConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var requiredCoreVersion = listenerCreate.requiredCoreVersion;

  if (requiredCoreVersion && !_semver2.default.satisfies(coreVersion, requiredCoreVersion)) {
    /* eslint-disable no-console */
    console.error('Incompatible listener (requires storyboard-core ' + requiredCoreVersion + ', current ' + coreVersion + ')');
    /* eslint-enable no-console */
    return null;
  }
  var listener = listenerCreate(userConfig, {
    mainStory: mainStory,
    filters: filters,
    ansiColors: ansiColors,
    recordToLines: _recordToLines2.default,
    chalk: _chalk2.default,
    hub: hubApiForListeners
  });
  listeners.push(listener);
  if (listener.init) listener.init();
  getBufferedMessages().forEach(function (msg) {
    return listener.process(msg);
  });
  return listener;
};

var removeListener = function removeListener(listener) {
  if (listener.tearDown) listener.tearDown();
  listeners = listeners.filter(function (o) {
    return o !== listener;
  });
};

var removeAllListeners = function removeAllListeners() {
  listeners.forEach(removeListener);
  listeners = [];
};

// -------------------------------------
// Message buffer
// -------------------------------------
var bufMessages = [];
var bufRecords = [];

var addToMsgBuffers = function addToMsgBuffers(msg) {
  bufMessages.push(msg);
  var _config = config,
      bufMsgSize = _config.bufMsgSize;

  if (bufMessages.length > bufMsgSize) bufMessages = bufMessages.slice(-bufMsgSize);
  if (msg.type === 'RECORDS') {
    var records = msg.data;
    var _config2 = config,
        bufSize = _config2.bufSize;

    bufRecords = bufRecords.concat(records);
    if (bufRecords.length > bufSize) bufRecords = bufRecords.slice(-bufSize);
  }
};

var getBufferedMessages = function getBufferedMessages() {
  return bufMessages;
};
var getBufferedRecords = function getBufferedRecords() {
  return bufRecords;
};

// -------------------------------------
// Emitting messages
// -------------------------------------
var emitMsgWithFields = function emitMsgWithFields(src, type, data, srcListener) {
  emitMsg({ src: src, hubId: hubId, type: type, data: data }, srcListener);
};

// Add message to buffer and broadcast it (to all but the sender)
var emitMsg = function emitMsg(msg, srcListener) {
  addToMsgBuffers(msg);
  listeners.forEach(function (listener) {
    if (listener === srcListener) return;
    listener.process(msg);
  });
};

// -------------------------------------
// APIs
// -------------------------------------
var hubApiForListeners = {
  getHubId: getHubId,
  emitMsgWithFields: emitMsgWithFields, emitMsg: emitMsg,
  getBufferedMessages: getBufferedMessages,
  getBufferedRecords: getBufferedRecords
};

exports.init = init;
exports.getHubId = getHubId;
exports.configure = configure;
exports.getListeners = getListeners;
exports.addListener = addListener;
exports.removeListener = removeListener;
exports.removeAllListeners = removeAllListeners;
exports.emitMsgWithFields = emitMsgWithFields;
exports.emitMsg = emitMsg;
exports.getBufferedMessages = getBufferedMessages;
exports.getBufferedRecords = getBufferedRecords;