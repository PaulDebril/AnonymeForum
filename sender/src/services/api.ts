import axios from 'axios';

// @ts-ignore - Config injectée au runtime
const API_BASE = window.ENV_CONFIG?.VITE_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

// POST /messages
export async function createMessage(message: NewMessage): Promise<Message> {
  const { data } = await axios.post<Message>(`${API_BASE}/messages`, message);
  return data;
}
