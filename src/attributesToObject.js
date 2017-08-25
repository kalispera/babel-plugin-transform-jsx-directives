export default function attributesToObject(t, attributes, directives) {
  const attributeDirectives = directives
    .filter(({ type }) => type === 'attribute')
    .map(({ name }) => name);

  return t.objectExpression(
    attributes
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
          t.isJSXExpressionContainer(attribute.get('value').node)
            ? attribute.get('value.expression').node
            : attribute.get('value').node
        );
      })
  );
}
