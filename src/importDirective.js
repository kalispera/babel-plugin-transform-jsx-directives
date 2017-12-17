import getImport from './getImport';
import insertBootstrap from './insertBootstrap';
import resolveSource from './resolveSource';

export default function importDirective(
  babel,
  path,
  directiveName,
  someDirectiveSource,
  bootstrap,
  options,
  basePath,
) {
  const directiveSource =
    typeof someDirectiveSource === 'function'
      ? someDirectiveSource(options, bootstrap)
      : someDirectiveSource;

  const resolvedSource = basePath
    ? resolveSource(basePath, directiveSource)
    : directiveSource;

  const someImport = getImport(
    babel,
    path,
    directiveName,
    resolvedSource,
    bootstrap,
  );

  if (bootstrap != null) {
    insertBootstrap(babel, someImport, bootstrap);
  }

  return someImport.get('specifiers.0.local.name').node;
}
