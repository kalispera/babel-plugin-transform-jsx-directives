import jsxSyntax from 'babel-plugin-syntax-jsx';
import normalizeDirectives from './normalizeDirectives';
import importDirective from './importDirective';
import createDirective from './createDirective';
import attributesToObject from './attributesToObject';
import getApplicableDirectives from './getApplicableDirectives';

function getUidIds(path) {
  return {
    Elm: path.scope.generateUidIdentifier('Elm'),
    props: path.scope.generateUidIdentifier('props'),
  };
}

export default function babelPluginTransformJsxDirectives(babel) {
  const t = babel.types;

  return {
    inherits: jsxSyntax,
    visitor: {
      JSXOpeningElement(path, state) {
        const directives = getApplicableDirectives(
          babel,
          path,
          normalizeDirectives(state.opts && state.opts.directives)
        );

        if (!directives.length) {
          return;
        }

        const jsxElement = path.parentPath;
        const name = path.get('name.name').node;
        const isComponent = name[0] === name[0].toUpperCase();
        const attributes = attributesToObject(t, path.get('attributes'), directives);
        const { Elm, props } = getUidIds(path);
        const { node: { children } } = jsxElement;

        const { inner } = directives.reduce((
          memo,
          {
            name: directiveName,
            source,
            options,
            globalOptions,
          },
          i
        ) => {
          const localName = importDirective(babel, path, directiveName, source);

          const isOuter = i === directives.length - 1;
          if (!isOuter) {
            const {
              Elm: newElm,
              props: newProps,
            } = getUidIds(path);

            return {
              inner: createDirective(
                t,
                localName,
                memo,
                t.jSXExpressionContainer(newElm),
                newProps,
                options,
                globalOptions
              ),
              Elm: newElm,
              props: newProps,
            };
          }

          return {
            inner: createDirective(
              t,
              localName,
              memo,
              isComponent
                ? t.jSXExpressionContainer(t.identifier(name))
                : t.stringLiteral(name),
              attributes,
              options,
              globalOptions
            ),
          };
        }, {
          Elm,
          props,
          inner: t.jSXElement(
            t.jSXOpeningElement(
              t.jSXIdentifier(Elm.name),
              [t.jSXSpreadAttribute(props)],
              children.length === 0
            ),
            t.jSXClosingElement(t.jSXIdentifier(Elm.name)),
            children,
            children.length === 0
          ),
        });

        jsxElement.replaceWith(inner);
      },
    },
  };
}

babelPluginTransformJsxDirectives.normalizeDirectives = normalizeDirectives;
