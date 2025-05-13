export interface Message {
  id: number;
  pseudo: string;
  contenu: string;
  date: string;
}

export function countMessages(messages: Message[]): number {
  return messages.length;
}
