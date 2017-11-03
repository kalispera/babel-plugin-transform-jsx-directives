const path = require('path');

function isNodeModule(file) {
  try {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require(`${file}/package.json`);
    return true;
  } catch (e) {
    return false;
  }
}

export default function resolveSource(file, source) {
  if (source.indexOf('.') !== 0) {
    return source;
  }

  if (isNodeModule(file)) {
    return path.join(file, source);
  }

  return path.resolve(path.dirname(file), source);
}
