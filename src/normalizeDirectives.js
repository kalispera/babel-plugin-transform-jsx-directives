const path = require('path');

function toArray(directive) {
  if (!Array.isArray(directive)) {
    return [directive];
  }

  return directive;
}

function load(directives, original = false) {
  try {
    return {
      file: directives,
      // eslint-disable-next-line import/no-dynamic-require, global-require
      directives: require(directives),
    };
  } catch (e) {
    if (!original) {
      return load(path.resolve(directives), directives);
    }

    throw e;
  }
}

function isNodeModule(file) {
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(`${file}/package.json`);
    return true;
  } catch (e) {
    return false;
  }
}

function resolveSource(file, source) {
  if (source.indexOf('.') !== 0) {
    return source;
  }

  if (isNodeModule(file)) {
    return path.join(file, source);
  }

  return path.resolve(path.dirname(file), source);
}

function prepare(someDirectives) {
  if (typeof someDirectives === 'string') {
    const { file, directives } = load(someDirectives);
    return toArray(directives).map((directive) => {
      return Object.assign({}, directive, {
        source: resolveSource(file, directive.source),
      });
    });
  }

  return toArray(someDirectives);
}

function addDefaults(directive) {
  return Object.assign({
    type: 'attribute',
    priority: 0,
  }, directive);
}

export default function normalizeDirectives(directives) {
  if (!directives) {
    return [];
  }

  return directives.reduce((memo, someDirectives) => {
    return memo.concat(prepare(someDirectives).map(addDefaults));
  }, []).sort(({ priority }, { priority: otherPriority }) => {
    return priority - otherPriority;
  });
}
