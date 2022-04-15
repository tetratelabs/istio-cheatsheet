var minimist = require('minimist');
var assign = require('lodash/assign');
var reduce = require('lodash/reduce');
var escapeRegExp = require('lodash/escapeRegExp');
var isPlainObject = require('lodash/isPlainObject');
var isArray = require('lodash/isArray');
var camelCase = require('lodash/camelCase');
var kebabCase = require('lodash/kebabCase');

function isIgnored(key, options) {
    var ignored = options.ignore || [];
    return ignored.indexOf(key) !== -1 ||
        ignored.indexOf(camelCase(key)) !== -1 ||
        ignored.indexOf(kebabCase(key)) !== -1;
}

function groupArgv(argv, identifier, options) {
    var search = escapeRegExp(identifier + (options.delimiter || '-'));
    // allow camelcased options
    if (!options.strict) {
        search += '?';
    }

    var rootVal = argv[identifier];
    var isBool = rootVal === true || rootVal === false;
    var regexp = new RegExp('^' + search + '(.+)$');
    var reduced = reduce(argv, function (res, val, key) {
        var isRoot = key === identifier || options.alias.indexOf(key) !== -1;
        var match = !isIgnored(key, options) && key.match(regexp);

        // initialize object
        if ((isRoot && rootVal !== false || match) && !isPlainObject(res[identifier])) {
            res[identifier] = {};
        } else if (isRoot && rootVal === false) {
            res[identifier] = false;
        }

        // root node has some value e.g. --group 5
        if (isRoot && !isBool) {
            res[identifier][options.default || 'default'] = rootVal;
        }

        // sibling e.g. --group-foo
        if (match) {
            res[identifier][options.camelCase && camelCase(match[1]) || match[1]] = val;
        }

        // rest
        if (!isRoot && !match) {
            res[key] = val;
        }

        return res;
    }, {});

    options.alias.forEach(function (alias) {
        reduced[alias] = reduced[identifier];
    });

    return reduced;
}

function findAlias(source, identifier) {
    return reduce(source || {}, function (res, val, key) {
        if (val === identifier) {
            res.push(key);
        }
        return res;
    }, []);
}

module.exports = function (identifier, options, minimistOpts) {
    options = assign({
        argv: process.argv.slice(2),
        ignore: [],
        camelCase: true,
        strict: true
    }, options || {});

    if (!minimistOpts) {
        minimistOpts = {};
    }

    if (isPlainObject(identifier)) {
        minimistOpts.alias = assign(minimistOpts.alias || {}, identifier);
    }

    var argv = isPlainObject(options.argv) && options.argv || minimist(options.argv, minimistOpts);

    if (isArray(identifier) || isPlainObject(identifier)) {
        return reduce(identifier, function (res, val) {
            return groupArgv(res, val, assign(options, {alias: findAlias(minimistOpts.alias, val)}));
        }, argv);
    }

    return groupArgv(argv, identifier, assign(options, {alias: findAlias(minimistOpts.alias, identifier)}));
};

