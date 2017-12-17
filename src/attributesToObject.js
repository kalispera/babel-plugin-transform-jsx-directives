function getAttributeValue(t, attribute) {
  if (attribute.get('value').node === null) {
    return t.booleanLiteral(true);
  }

  return t.isJSXExpressionContainer(attribute.get('value').node)
    ? attribute.get('value.expression').node
    : attribute.get('value').node;
}

export default function attributesToObject(t, someAttributes, directives) {
  const attributeDirectives = directives
    .filter(({ type }) => type === 'attribute')
    .map(({ name }) => name);

  const attributes = someAttributes
    .filter(attribute => {
      if (t.isJSXSpreadAttribute(attribute.node)) {
        return true;
      }

      const name = t.isJSXNamespacedName(attribute.get('name'))
        ? attribute.get('name.name.name').node
        : attribute.get('name.name').node;

      return attributeDirectives.indexOf(name) === -1;
    })
    .map(attribute => {
      if (t.isJSXSpreadAttribute(attribute.node)) {
        return t.spreadProperty(
          t.identifier(attribute.get('argument.name').node),
        );
      }

      return t.objectProperty(
        t.identifier(attribute.get('name.name').node),
        getAttributeValue(t, attribute),
      );
    });

  return t.objectExpression(attributes);
}
