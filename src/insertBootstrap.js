import template from 'babel-template';

const bootstrapTemplate = `
if (!BOOTSTRAP_NAME.__called) {
  BOOTSTRAP_NAME.__called = true;
  BOOTSTRAP_NAME(BOOTSTRAP_OPTIONS);
}
`;

function appendBootstrap(t, programBody, bootstrapNode) {
  programBody.find((childPath) => {
    return !t.isImportDeclaration(childPath);
  }).insertBefore(bootstrapNode);
}

export default function insertBootstrap({ types: t }, importPath, options) {
  const BOOTSTRAP_NAME = t.identifier(importPath.get('specifiers.1.local.name').node);

  const buildGlobalOptionsNode = template(`var x = ${JSON.stringify(options)};`);
  const BOOTSTRAP_OPTIONS = buildGlobalOptionsNode().declarations[0].init;

  const buildBootstrap = template(bootstrapTemplate);

  const bootstrapNode = buildBootstrap({
    BOOTSTRAP_NAME,
    BOOTSTRAP_OPTIONS,
  });

  appendBootstrap(
    t,
    importPath.parentPath.get('body'),
    bootstrapNode
  );
}
