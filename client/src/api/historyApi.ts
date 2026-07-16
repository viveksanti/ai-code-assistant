import axios from "axios";
import { HistoryItem } from "../types";

const client = axios.create({ baseURL: "/api", timeout: 30000 });

export async function fetchHistory(): Promise<HistoryItem[]> {
  const { data } = await client.get<{ items: HistoryItem[] }>("/history");
  return data.items;
}

export async function deleteHistoryItem(id: string): Promise<void> {
  await client.delete(`/history/${id}`);
}

export async function clearHistory(): Promise<void> {
  await client.delete("/history");
}