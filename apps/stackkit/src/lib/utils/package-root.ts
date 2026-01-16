import * as path from 'path';

export function getPackageRoot(): string {
  try {
    return path.dirname(path.dirname(require.resolve('stackkit/package.json')));
  } catch {
    return path.resolve(__dirname, '..', '..', '..', '..', '..');
  }
}