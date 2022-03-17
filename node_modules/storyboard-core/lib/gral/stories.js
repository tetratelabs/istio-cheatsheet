'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _platform = require('platform');

var _platform2 = _interopRequireDefault(_platform);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _lodash = require('../vendor/lodash');

var _ = _interopRequireWildcard(_lodash);

var _constants = require('./constants');

var _filters = require('./filters');

var _hub = require('./hub');

var _serialize = require('./serialize');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var version = require('../../package.json').version;

var DEFAULT_SRC = 'main';
var DEFAULT_CHILD_TITLE = '';

/* eslint-disable max-len */
var REVEAL_SEPARATOR_BEGIN = '\u250C\u2500\u2500 REVEALED PAST LOGS BEGIN HERE (due to warning/error)';
/* eslint-enable max-len */
var REVEAL_SEPARATOR_END = '\u2514\u2500\u2500 REVEALED PAST LOGS END HERE';

// Record formats:
// * 1 (or undefined): initial version
// * 2: embeds objects directly, not their visual representation
//   (does not call treeLines before attaching). Circular refs are removed
// * 3: include type signalType
var RECORD_FORMAT_VERSION = 3;

var hiddenStories = {};
var hubId = (0, _hub.getHubId)();

// -----------------------------------------------
// Helpers
// -----------------------------------------------
var getStoryId = function getStoryId() {
  return (_constants.IS_BROWSER ? 'cs/' : 'ss/') + _uuid2.default.v4();
};
var getRecordId = function getRecordId() {
  return (_constants.IS_BROWSER ? 'c-' : 's-') + _uuid2.default.v4();
};

// -----------------------------------------------
// Story
// -----------------------------------------------
function Story(_ref) {
  var parents = _ref.parents,
      src = _ref.src,
      title = _ref.title,
      levelNum = _ref.levelNum,
      fHiddenByFilter = _ref.fHiddenByFilter;

  this.parents = parents;
  this.fRoot = !parents.length;
  this.storyId = (this.fRoot ? '*/' : '') + getStoryId();
  this.src = src;
  this.title = title;
  this.level = levelNum;
  this.fServer = !_constants.IS_BROWSER;
  this.t = new Date().getTime();
  this.fOpen = true;
  this.status = undefined;
  this.hiddenRecords = [];
  this.fHiddenByFilter = fHiddenByFilter || !(0, _filters.passesFilter)(this.src, this.level);
  if (this.fHiddenByFilter) {
    hiddenStories[this.storyId] = this;
  }
  this.emitAction('CREATED', this.t);
}

// -----------------------------------------------
// Story lifecycle
// -----------------------------------------------
Story.prototype.close = function close() {
  this.fOpen = false;
  this.emitAction('CLOSED');
  if (this.fHiddenByFilter) {
    hiddenStories[this.storyId] = null;
    this.hiddenRecords = [];
  }
};

Story.prototype.changeTitle = function changeTitle(title) {
  this.title = title;
  this.emitAction('TITLE_CHANGED');
};

Story.prototype.changeStatus = function changeStatus(status) {
  this.status = status;
  this.emitAction('STATUS_CHANGED');
};

Story.prototype.child = function child() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var src = options.src,
      title = options.title;

  if (src == null) src = DEFAULT_SRC;
  if (title == null) title = DEFAULT_CHILD_TITLE;
  var extraParents = options.extraParents,
      levelStr = options.level;

  var levelNum = void 0;
  if (levelStr != null) levelNum = _constants.LEVEL_STR_TO_NUM[levelStr.toUpperCase()];
  if (levelNum == null) levelNum = _constants.LEVEL_STR_TO_NUM.INFO;
  var parents = [this.storyId];
  if (extraParents != null) parents = parents.concat(extraParents);
  return new Story({
    parents: parents,
    src: src,
    title: title,
    levelNum: levelNum,
    fHiddenByFilter: this.fHiddenByFilter
  });
};

// -----------------------------------------------
// Logs
// -----------------------------------------------
Object.keys(_constants.LEVEL_STR_TO_NUM).forEach(function (levelStr) {
  var levelNum = _constants.LEVEL_STR_TO_NUM[levelStr];
  Story.prototype[levelStr.toLowerCase()] = function log() {
    // Prepare arguments
    var src = void 0;
    var msg = void 0;
    var options = void 0;
    // `log.info msg`
    if (arguments.length <= 1) {
      src = DEFAULT_SRC;
      msg = (arguments.length <= 0 ? undefined : arguments[0]) != null ? arguments.length <= 0 ? undefined : arguments[0] : '';
      // `log.info msg, options`
    } else if (_.isObject(arguments.length <= 1 ? undefined : arguments[1])) {
      src = DEFAULT_SRC;
      msg = (arguments.length <= 0 ? undefined : arguments[0]) != null ? arguments.length <= 0 ? undefined : arguments[0] : '';
      options = arguments.length <= 1 ? undefined : arguments[1];
    } else {
      src = arguments.length <= 0 ? undefined : arguments[0];
      msg = arguments.length <= 1 ? undefined : arguments[1];
      options = arguments.length <= 2 ? undefined : arguments[2];
    }
    if (options == null) options = {};

    // Filtering rule #1
    if (!(0, _filters.passesFilter)(src, levelNum)) return;

    // Prepare record
    var record = { storyId: this.storyId, level: levelNum, src: src, msg: msg };
    processAttachments(record, options);
    completeRecord(record);

    // Filtering rule #2, specific to hidden stories
    if (this.fHiddenByFilter) {
      if (levelNum < _constants.LEVEL_STR_TO_NUM.WARN) {
        this.hiddenRecords.push(record);
        return;
      }
      emitRevealSeparator(REVEAL_SEPARATOR_BEGIN);
      this.reveal();
      emitRevealSeparator(REVEAL_SEPARATOR_END);
    }

    emit(record);
  };
});

// -----------------------------------------------
// Story helpers
// -----------------------------------------------
Story.prototype.emitAction = function emitAction(action, t) {
  var record = {
    parents: this.parents,
    fRoot: this.fRoot,
    storyId: this.storyId,
    src: this.src,
    title: this.title,
    level: this.level,
    fServer: this.fServer,
    t: t,
    fOpen: this.fOpen,
    status: this.status,
    fStory: true,
    action: action
  };
  completeRecord(record);
  if (this.fHiddenByFilter) {
    this.hiddenRecords.push(record);
    return;
  }
  emit(record);
};

// Reveal parents recursively, and then reveal myself
Story.prototype.reveal = function reveal() {
  this.parents.forEach(function (parentStoryId) {
    if (hiddenStories[parentStoryId] != null) {
      hiddenStories[parentStoryId].reveal();
    }
  });
  this.fHiddenByFilter = false;
  hiddenStories[this.storyId] = null;
  var hiddenRecords = this.hiddenRecords;

  for (var j = 0; j < hiddenRecords.length; j++) {
    emit(hiddenRecords[j]);
  }
  this.hiddenRecords = [];
};

// Records can be logs or stories:
// * Common to stories and logs:
//   - `id: string` (a unique record id)
//   - `hubId: string`
//   - `version: integer`
//   - `fStory: boolean`
//   - `fServer: boolean`
//   - `storyId: string`
//   - `t: number` [ms] (for stories, creation time)
//   - `src: string?`
//   - `level: number`
//   - `signalType: string` (undefined for ordinary, non-signalling records)
// * Only for stories:
//   - `fRoot: boolean`
//   - `title: string?`
//   - `action: string`
//   - `parents: Array`
// * Only for logs:
//   - `msg: string`
//   - `obj: object?`
//   - `objExpanded: bool?`
//   - `objLevel: integer?`
//   - `objOptions: object?`
//   - `objIsError: bool?`
/* eslint-disable no-param-reassign */
var completeRecord = function completeRecord(record) {
  record.id = getRecordId();
  record.hubId = hubId;
  record.version = RECORD_FORMAT_VERSION;
  if (record.t == null) record.t = new Date().getTime();
  record.fServer = !_constants.IS_BROWSER;
  if (record.fStory == null) record.fStory = false;
  if (record.fRoot == null) record.fRoot = false;
};

/* eslint-disable no-prototype-builtins */
var processAttachments = function processAttachments(record, options) {
  if (options.hasOwnProperty('attach')) {
    record.obj = options.attach;
    record.objExpanded = !options.attachInline;
  } else if (options.hasOwnProperty('attachInline')) {
    record.obj = options.attachInline;
    record.objExpanded = false;
  }
  if (record.hasOwnProperty('obj')) {
    var objLevel = void 0;
    if (options.attachLevel != null) {
      objLevel = _constants.LEVEL_STR_TO_NUM[options.attachLevel.toUpperCase()];
    }
    if (objLevel == null) objLevel = record.level;
    record.objLevel = objLevel;
    record.objOptions = _.pick(options, ['ignoreKeys']);
    record.objIsError = _.isError(record.obj);
    record.obj = (0, _serialize.serialize)(record.obj);
  }
};
/* eslint-enable no-prototype-builtins */
/* eslint-enable no-param-reassign */

var emitRevealSeparator = function emitRevealSeparator(msg) {
  var record = {
    storyId: mainStory.storyId,
    level: _constants.LEVEL_STR_TO_NUM.WARN,
    src: 'storyboard',
    msg: msg,
    signalType: 'REVEAL_SEPARATOR'
  };
  completeRecord(record);
  emit(record);
};

var emit = function emit(record) {
  (0, _hub.emitMsgWithFields)('STORIES', 'RECORDS', [record]);
};

// -----------------------------------------------
// Create the main story
// -----------------------------------------------
var platformStr = _platform2.default.description + ', SB ' + version;
var title = 'ROOT STORY: ' + _chalk2.default.italic.blue.bold(platformStr);
var mainStory = new Story({
  parents: [],
  src: 'storyboard',
  title: title,
  levelNum: _constants.LEVEL_STR_TO_NUM.INFO
});

// -----------------------------------------------
// API
// -----------------------------------------------
exports.default = mainStory;