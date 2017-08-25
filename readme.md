# babel-plugin-transform-jsx-directives

[![CircleCI](https://circleci.com/gh/Xiphe/babel-plugin-transform-jsx-directives/tree/master.svg?style=shield)](https://circleci.com/gh/Xiphe/babel-plugin-transform-jsx-directives/tree/master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Love and Peace](http://love-and-peace.github.io/love-and-peace/badges/base/v1.0.svg)](https://github.com/love-and-peace/love-and-peace/blob/master/versions/base/v1.0/en.md)

Functional directives for JSX elements based on element or prop name. Applied in the compiler.

## Install

`npm install --save-dev babel-plugin-transform-jsx-directives`

Add in your `.babelrc`

```json
{
  "plugins": [
    ["transform-jsx-directives", {
      "directives": [
        "path/to/a/directive.js",
        "path/to/another/directive.js"
      ]
    }]
  ]
}
```
