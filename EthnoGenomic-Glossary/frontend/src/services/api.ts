import axios from "axios";
import { Term, Relation, SearchResponse } from "../types/term";
import { UserRole } from "../types/user";

const envBase = import.meta.env.VITE_API_BASE_URL;

const baseURL = (() => {
  // Prefer explicit env (e.g., "/api" behind nginx); fall back to host:8000 for local dev.
  if (envBase) {
    return envBase;
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8000`;
  }
  return "http://localhost:8000";
})();

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchTerms = async (query?: string) => {
  const params = query ? { query } : undefined;
  const { data } = await api.get<SearchResponse>("/terms", { params });
  return data;
};

export const fetchTerm = async (id: string | number) => {
  const { data } = await api.get<Term>(`/terms/${id}`);
  return data;
};

export const fetchRelatedTerms = async (id: string | number) => {
  const { data } = await api.get<Relation[]>(`/terms/${id}/related`);
  return data;
};

export const fetchAlphabet = async (letter: string) => {
  const { data } = await api.get<Term[]>(`/alphabet/${letter}`);
  return data;
};

export const fetchSuggestions = async (query?: string, limit = 10) => {
  const params: Record<string, any> = { limit };
  if (query) params.q = query;
  const { data } = await api.get<string[]>("/suggestions", { params });
  return data;
};

export const login = async (email: string, password: string) => {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);
  const { data } = await api.post<{ access_token: string }>("/auth/login", params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  localStorage.setItem("token", data.access_token);
  return data.access_token;
};

export const fetchAdminTerms = async () => {
  const { data } = await api.get<Term[]>("/admin/terms");
  return data;
};

export const uploadJson = async (file: File) => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<Term[]>("/admin/import/json", form);
  return data;
};

export const uploadXls = async (file: File) => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<Term[]>("/admin/import/xls", form);
  return data;
};

export const downloadTemplateJson = () => `${baseURL}/admin/templates/json`;
export const downloadTemplateXls = () => `${baseURL}/admin/templates/xls`;

export const updateTermAdmin = async (id: number, payload: Partial<Term>) => {
  const { data } = await api.put<Term>(`/admin/terms/${id}`, payload);
  return data;
};

export const deleteTermAdmin = async (id: number) => {
  await api.delete(`/admin/terms/${id}`);
};
