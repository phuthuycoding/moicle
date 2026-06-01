import { DESCRIPTION_MAX_LENGTH } from '../../utils/editor-constants.js';

export const sanitizeDescription = (raw: string): string => {
  const flattened = raw.replace(/\s+/g, ' ').trim();
  if (flattened.length <= DESCRIPTION_MAX_LENGTH) {
    return flattened;
  }
  return flattened.slice(0, DESCRIPTION_MAX_LENGTH - 3) + '...';
};

const formatYamlDescription = (description: string): string => {
  const sanitized = sanitizeDescription(description);
  if (/[:#"'\n]/.test(sanitized)) {
    return `"${sanitized.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return sanitized;
};

export const buildCursorRuleMdc = (description: string, body: string): string => {
  const yamlDescription = formatYamlDescription(description);
  return `---
description: ${yamlDescription}
alwaysApply: false
---

${body}`;
};
