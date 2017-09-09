
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
    .filter((attribute) => {
      return t.isJSXSpreadAttribute(attribute.node) ||
        attributeDirectives.indexOf(attribute.get('name.name').node) === -1;
    })
    .map((attribute) => {
      if (t.isJSXSpreadAttribute(attribute.node)) {
        return t.spreadProperty(t.identifier(attribute.get('argument.name').node));
      }

      return t.objectProperty(
        t.identifier(attribute.get('name.name').node),
        getAttributeValue(t, attribute)
      );
    });

  return t.objectExpression(attributes);
}
