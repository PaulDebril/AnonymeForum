import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface HelloResponse {
  message: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}

export interface Message {
  id: number;
  pseudo: string;
  contenu: string;
  date: string;
}

export interface NewMessage {
  pseudo: string;
  contenu: string;
}

// GET /hello
export async function fetchHello(): Promise<HelloResponse> {
  const { data } = await axios.get<HelloResponse>(`${API_BASE}/hello`);
  return data;
}

// GET /health
export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await axios.get<HealthResponse>(`${API_BASE}/health`);
  return data;
}

// GET /messages
export async function fetchMessages(): Promise<Message[]> {
  const { data } = await axios.get<Message[]>(`${API_BASE}/messages`);
  return data;
}

// GET /messages/:id
export async function fetchMessageById(id: number): Promise<Message> {
  const { data } = await axios.get<Message>(`${API_BASE}/messages/${id}`);
  return data;
}

// POST /messages
export async function createMessage(message: NewMessage): Promise<Message> {
  const { data } = await axios.post<Message>(`${API_BASE}/messages`, message);
  return data;
}

// DELETE /messages/:id
export async function deleteMessage(id: number): Promise<{ status: string; message: string }> {
  const { data } = await axios.delete(`${API_BASE}/messages/${id}`);
  return data;
}
