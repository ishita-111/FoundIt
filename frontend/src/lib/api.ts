const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    ...(fetchOpts.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(fetchOpts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOpts,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const signup = (body: { name: string; email: string; password: string; studentId: string }) =>
  fetchAPI('/auth/signup', { method: 'POST', body: JSON.stringify(body) });

export const login = (body: { studentId: string; password: string }) =>
  fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(body) });

export const getMe = (token: string) =>
  fetchAPI('/auth/me', { token });

export const getItems = (params?: Record<string, string>, token?: string) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return fetchAPI(`/items${query}`, { token });
};

export const getItem = (id: string, token?: string) =>
  fetchAPI(`/items/${id}`, { token });

export const createItem = (formData: FormData, token: string) =>
  fetchAPI('/items', { method: 'POST', body: formData, token });

export const updateItem = (id: string, formData: FormData, token: string) =>
  fetchAPI(`/items/${id}`, { method: 'PUT', body: formData, token });

export const deleteItem = (id: string, token: string) =>
  fetchAPI(`/items/${id}`, { method: 'DELETE', token });

export const getMatches = (id: string, token: string) =>
  fetchAPI(`/items/${id}/matches`, { token });

export const getConversations = (token: string) =>
  fetchAPI('/messages/conversations', { token });

export const getMessages = (userId: string, token: string) =>
  fetchAPI(`/messages/${userId}`, { token });

export const sendMessage = (body: { receiver: string; content: string; item?: string }, token: string) =>
  fetchAPI('/messages', { method: 'POST', body: JSON.stringify(body), token });

export const uploadImage = (formData: FormData, token: string) =>
  fetchAPI('/upload', { method: 'POST', body: formData, token });

export const getUnreadCount = (token: string) =>
  fetchAPI('/messages/unread/count', { token });

export const deleteConversation = (userId: string, token: string) =>
  fetchAPI(`/messages/conversation/${userId}`, { method: 'DELETE', token });

export const blockUser = (userId: string, token: string) =>
  fetchAPI(`/auth/block/${userId}`, { method: 'POST', token });
