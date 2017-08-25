import getRootPath from './getRootPath';

export default function getImport({ types: t }, path, directiveName, directiveSource) {
  const rootPath = getRootPath(path);

  const existingImport = rootPath.get('body').find((bodyPath) => {
    if (!bodyPath.isImportDeclaration()) {
      return false;
    }

    return bodyPath.get('source.value').node === directiveSource;
  });

  if (existingImport) {
    return existingImport;
  }

  const uid = rootPath.scope.generateUidIdentifier(`${directiveName}Directive`);

  const newImport = t.importDeclaration(
    [t.importSpecifier(
      uid,
      t.identifier('render')
    )],
    t.stringLiteral(directiveSource)
  );

  rootPath.unshiftContainer('body', newImport);

  return rootPath.get('body.0');
}

