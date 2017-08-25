export default function getRootPath(path) {
  if (path.parentPath) {
    return getRootPath(path.parentPath);
  }

  return path;
}
