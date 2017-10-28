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
      JSXNamespacedName(path, state) {
        const openingElement = path.parentPath.parentPath;

        if (!t.isJSXOpeningElement(openingElement)) {
          return;
        }

        const directives = getApplicableDirectives(
          babel,
          openingElement,
          normalizeDirectives(state.opts && state.opts.directives)
        );
        const name = path.get('name.name').node;

        if (directives.filter(directive => directive.name === name).length) {
          path.skip();
        }
      },
      JSXOpeningElement(path, state) {
        if (t.isJSXNamespacedName(path.get('name'))) {
          return;
        }

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
            as,
            source,
            bootstrap,
            options,
            globalOptions,
          },
          i
        ) => {
          const localName = importDirective(
            babel,
            path,
            directiveName,
            source,
            bootstrap,
            globalOptions
          );

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
                globalOptions,
                as
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
              globalOptions,
              as
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
