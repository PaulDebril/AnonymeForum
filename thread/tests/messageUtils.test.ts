import { describe, it, expect } from 'vitest';
import { countMessages, Message } from '../src/utils/messageUtils';

describe('countMessages', () => {
  it('retourne 0 si la liste est vide', () => {
    expect(countMessages([])).toBe(0);
  });

  it('compte correctement les messages', () => {
    const messages: Message[] = [
      { id: 1, pseudo: 'Alice', contenu: 'Hello', date: '2025-05-13' },
      { id: 2, pseudo: 'Bob', contenu: 'Salut', date: '2025-05-13' },
    ];

    expect(countMessages(messages)).toBe(2);
  });
});
