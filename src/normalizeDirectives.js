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

function getBootstrapOptions(directive) {
  if (Array.isArray(directive)) {
    if (directive.length > 2) {
      throw new Error(
        `Unexpected directive declaration ${JSON.stringify(directive)}`,
      );
    }

    return {
      directive: directive[0],
      bootstrap: directive[1],
    };
  }

  return { directive };
}

function prepare(directiveWithOptions) {
  const { directive: someDirective, bootstrap } = getBootstrapOptions(
    directiveWithOptions,
  );

  if (typeof someDirective === 'string') {
    const { file, directives } = load(someDirective);
    return toArray(directives).map(directive => {
      return Object.assign({ bootstrap }, directive, {
        basePath: file,
      });
    });
  }

  return [Object.assign({}, { bootstrap }, someDirective)];
}

function addDefaults(directive) {
  return Object.assign(
    {
      type: 'attribute',
      priority: 0,
    },
    directive,
  );
}

export default function normalizeDirectives(directives) {
  if (!directives) {
    return [];
  }

  return directives
    .reduce((memo, directive) => {
      return memo.concat(prepare(directive).map(addDefaults));
    }, [])
    .sort(({ priority }, { priority: otherPriority }) => {
      return priority - otherPriority;
    });
}
