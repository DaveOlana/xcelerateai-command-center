import { defaultTemplates } from '../config/defaultTemplates.js';

export function normalizeTemplates(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry))
    .filter((entry) => (
      typeof entry.id === 'string' && entry.id.trim() &&
      typeof entry.label === 'string' && entry.label.trim() &&
      typeof entry.content === 'string' && entry.content.trim()
    ))
    .map((entry) => ({
      id: entry.id.trim(),
      label: entry.label.trim(),
      content: entry.content,
    }));
}

export function getTemplateValidationErrors(value, owner = 'Build entity') {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return [`${owner}: templates must be an array.`];

  const errors = [];
  const ids = new Set();
  value.forEach((entry, index) => {
    const label = `${owner} template ${index + 1}`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push(`${label} must be an object.`);
      return;
    }
    if (typeof entry.id !== 'string' || !entry.id.trim()) {
      errors.push(`${label} requires a non-empty string id.`);
    } else if (ids.has(entry.id.trim())) {
      errors.push(`${owner}: template IDs must be unique; duplicate "${entry.id.trim()}".`);
    } else {
      ids.add(entry.id.trim());
    }
    if (typeof entry.label !== 'string' || !entry.label.trim()) {
      errors.push(`${label} requires a non-empty string label.`);
    }
    if (typeof entry.content !== 'string' || !entry.content.trim()) {
      errors.push(`${label} requires non-empty string content.`);
    }
  });
  return errors;
}

export function requiresReadmeScaffold(buildEntity) {
  if (!buildEntity || typeof buildEntity !== 'object') return false;
  if (typeof buildEntity.readmePrompt === 'string' && buildEntity.readmePrompt.trim()) return true;
  const files = Array.isArray(buildEntity.filesToCreate) ? buildEntity.filesToCreate : [];
  return files.some((file) => {
    const path = typeof file === 'string' ? file : file?.name || file?.path || '';
    const filename = String(path).split(/[\\/]/).pop();
    return /^readme(?:\.md)?$/i.test(filename);
  });
}

export function resolveTemplates(buildEntity) {
  const authored = normalizeTemplates(buildEntity?.templates);
  if (authored.some((template) => template.id === 'readme') || !requiresReadmeScaffold(buildEntity)) {
    return authored;
  }
  return [...authored, { ...defaultTemplates.readme }];
}

export async function writeTemplateToClipboard(content, clipboard = globalThis.navigator?.clipboard) {
  if (!clipboard?.writeText) return { ok: false, error: 'Clipboard access is unavailable.' };
  try {
    await clipboard.writeText(content);
    return { ok: true, error: null };
  } catch (error) {
    return { ok: false, error: error?.message || 'Clipboard permission was denied.' };
  }
}
