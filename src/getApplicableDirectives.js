export default function getApplicableDirectives(babel, path, directives) {
  const t = babel.types;

  if (!directives.length) {
    return [];
  }

  const elementName = path.get('name.name').node;
  const attributes = path
    .get('attributes')
    .map(attribute => {
      if (t.isJSXSpreadAttribute(attribute.node)) {
        return null;
      }

      if (t.isJSXNamespacedName(attribute.get('name'))) {
        return {
          name: attribute.get('name.name.name').node,
          as: attribute.get('name.namespace.name').node,
          value: attribute.get('value').node,
        };
      }

      return {
        name: attribute.get('name.name').node,
        value: attribute.get('value').node,
      };
    })
    .filter(a => a);

  return directives.reduce((memo, directive) => {
    if (directive.type === 'element' && elementName === directive.name) {
      memo.push(directive);
    } else if (directive.type === 'attribute') {
      attributes
        .filter(({ name }) => directive.name === name)
        .forEach(attribute => {
          memo.push(
            Object.assign({}, directive, {
              transformOptions: null,
              as: attribute.as,
              options: directive.transformOptions
                ? directive.transformOptions(babel, attribute.value)
                : attribute.value,
            }),
          );
        });
    }

    return memo;
  }, []);
}
