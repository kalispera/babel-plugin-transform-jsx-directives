export default function createDirective(
  t,
  directiveName,
  inner,
  Elm,
  props,
  options
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
    targetAttributes.push(
      t.jSXAttribute(
        t.jSXIdentifier('options'),
        options
      )
    );
  }

  targetAttributes.push(
    t.jSXAttribute(
      t.jSXIdentifier('next'),
      t.jSXExpressionContainer(
        t.arrowFunctionExpression(
          [inner.Elm, inner.props],
          inner.inner
        )
      )
    )
  );

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
