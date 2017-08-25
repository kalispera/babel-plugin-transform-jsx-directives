import getImport from './getImport';

export default function importDirective(babel, path, directiveName, directiveSource) {
  const someImport = getImport(babel, path, directiveName, directiveSource);

  return someImport.get('specifiers.0.local.name').node;
}
