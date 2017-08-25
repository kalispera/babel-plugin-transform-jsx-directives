import { resolve } from 'path';

let cache = null;

export default function getDirectives(opts) {
  if (!cache) {
    if (!opts.directives) {
      cache = [];
      return cache;
    }
    cache = opts.directives.map((someSource) => {
      const source = resolve(someSource);
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const directive = require(source);

      return Object.keys(directive).reduce((memo, key) => {
        if (key !== 'render') {
          // eslint-disable-next-line no-param-reassign
          memo[key] = directive[key];
        }

        return memo;
      }, { source, type: 'attribute', priority: 0 });
    }).sort(({ priority }, { priority: otherPriority }) => {
      return priority - otherPriority;
    });
  }

  return cache;
}

export function reset() {
  cache = null;
}
