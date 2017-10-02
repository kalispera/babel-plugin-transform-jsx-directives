export default function getApplicableDirectives(babel, path, directives) {
  const t = babel.types;

  if (!directives.length) {
    return [];
  }

  const name = path.get('name.name').node;
  const attributes = path.get('attributes').map((attribute) => {
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
  }).filter(a => a);

  return directives.reduce(
    (
      memo,
      {
        name: directiveName,
        type,
        source,
        transformOptions,
        globalOptions,
      }
    ) => {
      const viaAttribute = type === 'attribute';

      if (
        (
          type === 'element' &&
          name === directiveName
        ) || (
          viaAttribute &&
          attributes.map(({ name: n }) => n).indexOf(directiveName) !== -1
        )
      ) {
        const directive = {
          name: directiveName,
          globalOptions,
          type,
          source,
        };

        if (viaAttribute) {
          const { value: options, as } = attributes.find(({ name: n }) => n === directiveName);

          directive.as = as;
          directive.options = transformOptions
            ? transformOptions(babel, options)
            : options;
        }

        memo.push(directive);
      }

      return memo;
    },
    []
  );
}
