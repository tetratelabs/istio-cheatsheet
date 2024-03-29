# Developer notes

## Starting a local instance

This starts Jekyll and Webpack.

```bash
yarn install
bundle install
env PORT=4001 yarn run dev
```

## CSS classes

See the [Cheatsheet Style](https://jimmysong.io/cheatsheets/cheatsheet-styles) for a reference on styling.

## JavaScript

When updating JavaScript, be sure webpack is running (`yarn run dev` takes care of this).

This auto-updates `/assets/packed/` with sources in `_js/`.

## JavaScript tests

There are also automated tests:

```
yarn run test --watch
```

## Frontmatter

Each sheet supports these metadata:

```yml
---
title: React.js
layout: 2017/sheet   # 'default' | '2017/sheet'

# Optional:
category: React
updated: 2017-08-30       # To show in the updated list
ads: false                # Add this to disable ads
weight: -5                # lower number = higher in related posts list
deprecated: true          # Don't show in related posts
deprecated_by: /enzyme    # Point to latest version
prism_languages: [vim]    # Extra syntax highlighting
intro: |
  This is some *Markdown* at the beginning of the article.
tags:
  - WIP
  - Featured

# Special pages:
# (don't set these for cheatsheets)
type: home                # home | article | error
og_type: website          # opengraph type
---
```

## Prism languages

For supported prism languages:

- <https://github.com/PrismJS/prism/tree/gh-pages/components>

## Setting up redirects

This example sets up a redirect from `es2015` to `es6`:

```yml
# /es2015.md
---
title: ES2015
category: Hidden
redirect_to: /es6
---
```

## Localizations

See `_data/content.yml` for chrome strings.

## Forking

So you want to fork this repo? Sure, here's what you need to know to whitelabel this:

- It's all GitHub pages, so the branch has to be `gh-pages`.
- All other GitHub pages gotchas apply (CNAME, etc).
- Edit everything in `_data/` - this holds all 'config' for the site: ad IDs, strings, etc.
- Edit `_config.yml` as well, lots of things may not apply to you.

## SEO description

There are multiple ways to set meta description.

### keywords (and intro)

Set `keywords` (and optionally `intro`). This is the easiest and the preferred
way for now.

```
React cheatsheet - jimmysong.io
------------------------------
https://jimmysong.io/cheatsheets/react ▼
React.Component · render() · componentDidMount() · props/state · React is a
JavaScript library for building web...
```

### description (and intro)

Set `description` (and optionally `intro`)

```bash
React cheatsheet - jimmysong.io
------------------------------
https://jimmysong.io/cheatsheets/react ▼
One-page reference to React and its API. React is a JavaScript library for
building web user interfaces...
```

### intro only

If you left out `description` or `keywords`, a default description will be added.

## Critical path CSS

The critical path CSS is stored in:

- `_includes/2017/critical/home.html`
- `_includes/2017/critical/sheet.html`

You'll need to update these every now and then when you change something in the CSS. Use this to update these snippets:

```bash
yarn run critical
```

You can temporarily disable critical path optimizations by loading it with `?nocrit=1`, eg, `https://jimmysong.io/cheatsheets/?nocrit=1`.

## Critical path JS

There's JavaScript that's included inline in every page. It's entrypoint is:

- `_js/critical.js`

This is automatically compiled into the partial `_includes/2017/critical/critical.js`. Keep this bundle as small as possible.
