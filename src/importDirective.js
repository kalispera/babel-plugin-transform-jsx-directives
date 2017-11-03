import getImport from './getImport';
import insertBootstrap from './insertBootstrap';

export default function importDirective(
  babel,
  path,
  directiveName,
  someDirectiveSource,
  bootstrap,
  options
) {
  const directiveSource = typeof someDirectiveSource === 'function'
    ? someDirectiveSource(options, bootstrap)
    : someDirectiveSource;

  const someImport = getImport(babel, path, directiveName, directiveSource, bootstrap);

  if (bootstrap != null) {
    insertBootstrap(babel, someImport, bootstrap);
  }

  return someImport.get('specifiers.0.local.name').node;
}
