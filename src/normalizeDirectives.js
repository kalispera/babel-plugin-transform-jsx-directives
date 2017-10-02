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

function getGlobalOptions(directive) {
  if (Array.isArray(directive)) {
    if (directive.length > 2) {
      throw new Error(`Unexpected directive declaration ${JSON.stringify(directive)}`);
    }

    return {
      directive: directive[0],
      globalOptions: directive[1],
    };
  }

  return { directive };
}

function prepare(directiveWithOptions) {
  const { directive: someDirective, globalOptions } = getGlobalOptions(directiveWithOptions);

  if (typeof someDirective === 'string') {
    const { file, directives } = load(someDirective);
    return toArray(directives).map((directive) => {
      return Object.assign({}, directive, {
        source: resolveSource(file, directive.source),
        globalOptions,
      });
    });
  }

  return [Object.assign({}, { globalOptions }, someDirective)];
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

  return directives.reduce((memo, directive) => {
    return memo.concat(prepare(directive).map(addDefaults));
  }, []).sort(({ priority }, { priority: otherPriority }) => {
    return priority - otherPriority;
  });
}
