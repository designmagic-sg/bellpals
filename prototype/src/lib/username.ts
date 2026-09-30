import type { Person } from '../data/mock';

export function checkUsername(username: string, people: Record<string, Person>): { ok: boolean; message: string } {
  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    return { ok: false, message: '3–20 characters: lowercase letters, numbers, dots and underscores.' };
  }
  if (Object.values(people).some((p) => p.username === username)) {
    return { ok: false, message: `@${username} is taken.` };
  }
  return { ok: true, message: `@${username} is available.` };
}
