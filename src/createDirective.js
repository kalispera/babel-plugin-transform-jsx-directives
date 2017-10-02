import template from 'babel-template';

export default function createDirective(
  t,
  directiveName,
  inner,
  Elm,
  props,
  options,
  globalOptions,
  as
) {
  const targetAttributes = [
    t.jSXAttribute(
      t.jSXIdentifier('Elm'),
      Elm
    ),
    t.jSXAttribute(
      t.jSXIdentifier('props'),
      t.jSXExpressionContainer(props)
    ),
  ];

  if (options) {
    targetAttributes.push(t.jSXAttribute(
      t.jSXIdentifier('options'),
      options
    ));
  }

  if (as) {
    targetAttributes.push(t.jSXAttribute(
      t.jSXIdentifier('as'),
      t.StringLiteral(as)
    ));
  }

  if (globalOptions) {
    const buildGlobalOptionsNode = template(`var x = ${JSON.stringify(globalOptions)};`);
    const globalOptionsNode = buildGlobalOptionsNode().declarations[0].init;

    targetAttributes.push(t.jSXAttribute(
      t.jSXIdentifier('globalOptions'),
      t.JSXExpressionContainer(globalOptionsNode)
    ));
  }

  targetAttributes.push(t.jSXAttribute(
    t.jSXIdentifier('next'),
    t.jSXExpressionContainer(t.arrowFunctionExpression(
      [inner.Elm, inner.props],
      inner.inner
    ))
  ));

  return t.jSXElement(
    t.jSXOpeningElement(
      t.jSXIdentifier(directiveName),
      targetAttributes,
      true
    ),
    t.jSXClosingElement(t.jSXIdentifier(directiveName)),
    [],
    true
  );
}
