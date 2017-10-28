import getRootPath from './getRootPath';

export default function getImport({ types: t }, path, directiveName, directiveSource, bootstrap) {
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
  const bootstrapUid = rootPath.scope.generateUidIdentifier(`${directiveName}Bootstrap`);

  const specifiers = [t.importDefaultSpecifier(uid)];

  if (bootstrap != null) {
    specifiers.push(t.importSpecifier(
      bootstrapUid,
      t.identifier('bootstrap')
    ));
  }

  const newImport = t.importDeclaration(
    specifiers,
    t.stringLiteral(directiveSource)
  );

  rootPath.unshiftContainer('body', newImport);

  return rootPath.get('body.0');
}

