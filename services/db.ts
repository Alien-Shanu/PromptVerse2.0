import { Prompt, PromptCategory } from '../types';

const API_BASE = '/api';

export interface PaginatedResult {
  prompts: Prompt[];
  total: number;
}

const parseJsonResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
};

export const getPromptsPaginated = async (
  page: number, 
  pageSize: number,
  category: PromptCategory | 'All' = 'All',
  searchQuery: string = ''
): Promise<PaginatedResult> => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    category: String(category),
    query: searchQuery || '',
  });

  const res = await fetch(`${API_BASE}/prompts?${params.toString()}`, { credentials: 'include' });
  return parseJsonResponse<PaginatedResult>(res);
};

export const getRecentPrompts = async (limit: number = 50): Promise<Prompt[]> => {
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(`${API_BASE}/prompts/recent?${params.toString()}`, { credentials: 'include' });
  return parseJsonResponse<Prompt[]>(res);
};

export const getPopularPrompts = async (limit: number = 50): Promise<Prompt[]> => {
  const params = new URLSearchParams({ limit: String(limit) });
  const res = await fetch(`${API_BASE}/prompts/popular?${params.toString()}`, { credentials: 'include' });
  return parseJsonResponse<Prompt[]>(res);
};

export const getCategoryCounts = async (): Promise<Record<string, number>> => {
  const res = await fetch(`${API_BASE}/prompts/category-counts`, { credentials: 'include' });
  return parseJsonResponse<Record<string, number>>(res);
};

export const createPrompt = async (
  prompt: Omit<Prompt, 'id' | 'createdAt'> & Partial<Pick<Prompt, 'id' | 'createdAt'>>
): Promise<Prompt> => {
  const res = await fetch(`${API_BASE}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(prompt),
  });
  return parseJsonResponse<Prompt>(res);
};

export const updatePrompt = async (prompt: Prompt): Promise<Prompt> => {
  const res = await fetch(`${API_BASE}/prompts/${encodeURIComponent(prompt.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(prompt),
  });
  return parseJsonResponse<Prompt>(res);
};

export const toggleLike = async (promptId: string): Promise<{ liked: boolean; likes: number }> => {
  const res = await fetch(`${API_BASE}/prompts/${encodeURIComponent(promptId)}/like-toggle`, {
    method: 'POST',
    credentials: 'include',
  });
  return parseJsonResponse<{ liked: boolean; likes: number }>(res);
};

export const incrementCopy = async (promptId: string): Promise<{ copies: number }> => {
  const res = await fetch(`${API_BASE}/prompts/${encodeURIComponent(promptId)}/copy`, {
    method: 'POST',
    credentials: 'include',
  });
  return parseJsonResponse<{ copies: number }>(res);
};

export const setRating = async (promptId: string, rating: number): Promise<{ rating: number }> => {
  const res = await fetch(`${API_BASE}/prompts/${encodeURIComponent(promptId)}/rating`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ rating }),
  });
  return parseJsonResponse<{ rating: number }>(res);
};

export const getAdminStatus = async (): Promise<{ unlocked: boolean }> => {
  const res = await fetch(`${API_BASE}/admin/status`, { credentials: 'include' });
  return parseJsonResponse<{ unlocked: boolean }>(res);
};

export const unlockInitialLikes = async (token: string): Promise<{ unlocked: boolean }> => {
  const res = await fetch(`${API_BASE}/admin/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token }),
  });
  return parseJsonResponse<{ unlocked: boolean }>(res);
};
