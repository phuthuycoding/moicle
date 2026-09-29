export const sanitizeDescription = (raw: string): string =>
  raw.replace(/\s+/g, ' ').trim();

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
