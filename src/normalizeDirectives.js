export default function normalizeDirectives(opts) {
  if (!opts.directives) {
    return [];
  }

  return opts.directives.map((directive) => {
    return Object.assign({
      type: 'attribute',
      priority: 0,
    }, directive);
  }).sort(({ priority }, { priority: otherPriority }) => {
    return priority - otherPriority;
  });
}
