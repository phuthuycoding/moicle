import fs from 'fs';
import type { FileResult } from '../../types.js';

/** Write content only if it differs; report created/updated/exists. */
export const writeIfChanged = (targetFile: string, content: string, name: string): FileResult => {
  if (fs.existsSync(targetFile)) {
    if (fs.readFileSync(targetFile, 'utf-8') === content) {
      return { status: 'exists', name };
    }
    fs.writeFileSync(targetFile, content);
    return { status: 'updated', name };
  }
  fs.writeFileSync(targetFile, content);
  return { status: 'created', name };
};
