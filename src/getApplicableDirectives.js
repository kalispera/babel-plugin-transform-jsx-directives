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
    return attribute.get('name.name').node;
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
          attributes.indexOf(directiveName) !== -1
        )
      ) {
        const directive = {
          name: directiveName,
          globalOptions,
          type,
          source,
        };

        if (viaAttribute) {
          const options = path.get('attributes').find((attribute) => {
            return !t.isJSXSpreadAttribute(attribute.node) &&
              attribute.get('name.name').node === directiveName;
          }).get('value').node;

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
