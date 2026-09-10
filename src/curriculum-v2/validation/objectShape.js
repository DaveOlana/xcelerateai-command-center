export function rejectUnknownProperties(value, allowedProperties, label, add, code = 'V001-B026') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const allowed = new Set(allowedProperties);
  Object.keys(value).forEach((key) => {
    if (!allowed.has(key)) add(code, `${label} contains unknown property "${key}".`);
  });
}
