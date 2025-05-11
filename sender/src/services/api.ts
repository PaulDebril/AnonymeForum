import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';



export interface HelloResponse {
  message: string;
}

export async function fetchHello(): Promise<HelloResponse> {
  const { data } = await axios.get<HelloResponse>(`${API_BASE}/hello`);
  return data;
}
