# group-args [![Build Status](https://travis-ci.org/bezoerb/group-args.svg?branch=master)](https://travis-ci.org/bezoerb/group-args)

> CLI helper to group commandline arguments


## Install

```
$ npm install --save group-args
```


## Usage

```bash
node ./cli.js --foo --bar something --group-a 1 --group-b 2
```
```js
const groupArgs = require('group-args');

// process.argv: [
groupArgs('group');
//=> {foo: true, bar: 'something', group: { a: 1, b: 2 }}
```


## API

### groupArgs(key, [options], [minimistOptions])

#### key

Type: `string|array|object`

Group arguments by key. When passing an object it is
Could be `'key'`, `['key1','key2']`, `{alias1: 'key1', alias2: 'key2'}`

#### options

##### argv

Type: `array|object`<br>
Default: `process.argv.slice(2)`

Arguments array or already parsed arguments.

##### delimiter

Type: `string`<br>
Default: `-`

Delimiter between group identifier & key.

##### strict

Type: `bool`<br>
Default: `true`

Disable to allow camelCased arguments provided by e.g. [`meow`](https://github.com/sindresorhus/meow)

##### alias

Type: `string`<br>
Default: `undefined`

Alias for identifier (short opt)

##### camelCase

Type: `bool`<br>
Default: `true`

camelCase grouped arguments

#### minimistOptions

See [`minimist`](https://github.com/substack/minimist#var-argv--parseargsargs-opts)

## License

MIT © [Ben Zörb](http://sommerlaune.com)
