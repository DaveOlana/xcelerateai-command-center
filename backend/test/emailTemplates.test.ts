import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../supabase/email-templates');

describe('Supabase Auth email templates', () => {
  for (const filename of ['confirm-signup.html', 'reset-password.html']) {
    test(`${filename} is branded, email-safe, and uses only the documented action URL`, async () => {
      const html = await readFile(resolve(directory, filename), 'utf8');
      expect(html).toContain('XcelerateAI');
      expect(html).toContain('Learning OS');
      expect(html).toContain('{{ .ConfirmationURL }}');
      expect(html).toContain('style=');
      expect(html).not.toMatch(/<img\b/i);
      expect([...html.matchAll(/{{\s*[^}]+\s*}}/g)].map(([value]) => value)).toEqual([
        '{{ .ConfirmationURL }}',
        '{{ .ConfirmationURL }}',
        '{{ .ConfirmationURL }}',
      ]);
    });
  }

  test('manual setup documents both templates and the custom SMTP limitation', async () => {
    const readme = await readFile(resolve(directory, 'README.md'), 'utf8');
    expect(readme).toContain('Confirm signup');
    expect(readme).toContain('Reset password');
    expect(readme).toContain('custom SMTP');
    expect(readme).toContain('http://localhost:5173/**');
  });
});
