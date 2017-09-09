# babel-plugin-transform-jsx-directives

[![CircleCI](https://circleci.com/gh/Xiphe/babel-plugin-transform-jsx-directives/tree/master.svg?style=shield)](https://circleci.com/gh/Xiphe/babel-plugin-transform-jsx-directives/tree/master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Love and Peace](http://love-and-peace.github.io/love-and-peace/badges/base/v1.0.svg)](https://github.com/love-and-peace/love-and-peace/blob/master/versions/base/v1.0/en.md)

Functional directives for JSX elements based on element or attribute name.  
Think of it as globally available on-demand higher order components.

## Install

`npm install --save-dev babel-plugin-transform-jsx-directives`

## Config

Add in your `.babelrc`

```json
{
  "plugins": [
    ["transform-jsx-directives", {
      "directives": [
        {
          "type": "element",
          "name": "button",
          "priority": 100,
          "source": "./myButtonDirective.js"
        },
        "directive-module",
        "path/to/a/directiveConfiguration.js"
      ]
    }]
  ]
}
```

## Plugin Options

 - `directives` (Array): A mandatory* array of [configurations](#directive-configuration)
   or node modules/files providing one or more configurations.

_* Not really mandatory, but this plugin wont do nothing without specific configurations_

### Directive Configuration

 - `name` (String): When a element or attribute (see type) matches the name,
   the directive gets applied
 - `source` (String): path to the directive runtime component
 - `type` ("attribute"|"element"): whether the directive should be applied
   on matches against element names or attribute names. Default: "attribute"
 - `priority` (Integer): Directives with a higher priority run first, Default: 0
 - `transformOptions` (Function): Only for attribute directives. Optional transformer
   for the options node. See [Transform Options](#transform-options)


## Why?

My main motivation behind this plugin is to provide a clean way of 
extending the feature set of a JSX target library.

I recommend sticking to plain old components and higher order components
when working on application specific solutions.

Use directives in cases where you want to provide a globally available
abstraction for a complex solution that feels like it's part of the 
library you're using.


## How does this work?

Assuming we want every button in our app to alert "baby don't hurt me" on click.

This is our `button.jsx` file

```jsx
<button>What is love?</button>
```

when we use this directive configuration

```json
{
  "name": "button",
  "type": "element",
  "source": "./HaddawayButton.js"
}
```

the directive plugin will transform our `button.jsx` into

```jsx
import _buttonDirective from './HaddawayButton.js';

<_buttonDirective
  Elm="button"
  props={{}}
  next={(_Elm, _props) => <_Elm {..._props} />}
/>
```

the last bit is now the implementation of `HaddawayButton.js`

```jsx
function whatIsLove() {
  alert('baby don\'t hurt me');
}

export default function HaddawayButton({ Elm, props, next }) {
  return next(Elm, { ...props, onClick: whatIsLove });
} 
```

and voilà you have an earworm.



## Directive Runtime Components

As shown in the [example](#How–does–this-work), directive components
receive `Elm`, `props`, `next` and attribute directives additionally `options`.
Since the runtime is just another component, it can utilize all features of the
target library, like [context](https://facebook.github.io/react/docs/context.html) in React.

- `Elm`: Element name or component, the directive was matched against.

  Directives can manipulate the element by passing a new one into `next`.   
  Since multiple directives can be applied to the same element, `Elm` is not necessarily
  the original element.

- `props`: Object of all attributes used on the element.

  Can be manipulated by passing new props into `next`.  
  Since multiple directives can be applied to the same element, these are not necessarily
  the original attributes.

- `next`: Callback function that will apply the next directive or create the child elements.

  A no-op directive would just `return next(Elm, props)`.  

  A directive can also decide to not call `next` at all and prevent creation
  of all child components.

- `options`: Value of the directive attribute. _(Only available on attribute directives)_

  Given this jsx `<div foo="bar" />`, a `foo` attribute directive would receive
  `"bar"` as `options`:

  The original attribute used for `options` is excluded from `props`.

  Parent directives have no access to the `options` of child directives
  so this always is the original value.

  Directives can provide an [option transformer](#transform-options) in order to
  mutate own options beforehand.


## Transform Options

A `transformOptions(babel, node)` function provided to a [Directive Configuration](#directive-configuration) that returns a (new) babel node.

The main Idea here is to support transforming of [Domain-specific languages](https://en.wikipedia.org/wiki/Domain-specific_language)
for attribute directives pre-runtime but it also could be used for validation or to add defaults.

### Example:

Lets say our directive expects an object as options but we want to provide a 
shorthand for `{ value: 'Foo' }` and just use `"Foo"` in that case.

```js
{
  name: 'foo',
  type: 'attribute',
  transformOptions({ types: t }, node) {
    if (!t.isStringLiteral(node)) {
      return node;
    }

    return t.jSXExpressionContainer(
      t.objectExpression([
        t.objectProperty(
          t.identifier('value'),
          node
        ),
      ])
    );
  }
}
```


License
-------

> The MIT License
> 
> Copyright (C) 2017 Hannes Diercks
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of
> this software and associated documentation files (the "Software"), to deal in
> the Software without restriction, including without limitation the rights to
> use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
> of the Software, and to permit persons to whom the Software is furnished to do
> so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
> FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
> COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
> IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
> CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
