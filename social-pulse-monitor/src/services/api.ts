// API service for backend communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Post {
  id: number;
  text: string;
  timestamp: string;
  source: string;
  keyword_matched: string | null;
  sentiment_label: string | null;
  sentiment_score: number | null;
  processing_status: string;
  created_at: string;
}

export interface Keyword {
  id: number;
  keyword: string;
  created_at: string;
}

export interface DashboardStats {
  total_mentions: number;
  sentiment_breakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface TrendDataPoint {
  hour: string;
  positive: number;
  neutral: number;
  negative: number;
}

// Keyword Management
export async function fetchKeywords(): Promise<Keyword[]> {
  const response = await fetch(`${API_BASE_URL}/api/keywords`);
  const data = await response.json();
  return data.keywords;
}

export async function addKeyword(keyword: string): Promise<Keyword> {
  const response = await fetch(`${API_BASE_URL}/api/keywords`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyword }),
  });
  return response.json();
}

export async function deleteKeyword(keywordId: number): Promise<void> {
  await fetch(`${API_BASE_URL}/api/keywords/${keywordId}`, {
    method: 'DELETE',
  });
}

// Posts
export async function ingestPost(text: string, source: string = 'Manual'): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/posts/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      timestamp: new Date().toISOString(),
      source,
    }),
  });
  return response.json();
}

// Dashboard Data
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
  return response.json();
}

export async function fetchRecentPosts(): Promise<Post[]> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/recent`);
  const data = await response.json();
  return data.posts;
}

export async function fetchTrends(hours: number = 24): Promise<TrendDataPoint[]> {
  const response = await fetch(`${API_BASE_URL}/api/dashboard/trends?hours=${hours}`);
  const data = await response.json();
  return data.trends;
}

// Simulation
export async function startSimulation(count: number = 20, interval: number = 2): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/posts/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, interval }),
  });
  return response.json();
}

export async function getSimulationStatus(): Promise<{ running: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/posts/simulate/status`);
  return response.json();
}

// Server-Sent Events for real-time updates
export function createEventSource(): EventSource {
  return new EventSource(`${API_BASE_URL}/api/events`);
}
