import { apiFetch } from "./client";

// ─── Types (espelhando os serializers da API) ─────────────────────────────────

export interface ApiAccount {
  id: string;
  name: string;
  phone: string;
  avatar_url: string;
  color: string;
  uazapi_instance: string;
  is_connected: boolean;
  created_at: string;
}

export interface ApiConversation {
  id: string;
  account: string;
  contact_name: string;
  contact_phone: string;
  contact_avatar: string;
  status: "open" | "resolved" | "archived";
  unread_count: number;
  last_message_at: string | null;
  last_message_preview: string;
}

export interface ApiMessage {
  id: string;
  conversation: string;
  uazapi_message_id: string | null;
  direction: "inbound" | "outbound";
  message_type: "text" | "image" | "audio" | "video" | "document" | "sticker" | "location" | "contact";
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  content: string;
  media_url: string;
  media_mime: string;
  media_filename: string;
  audio_duration_seconds: number | null;
  audio_transcription: string;
  quoted_message_id: string;
  quoted_content: string;
  timestamp: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(username: string, password: string) {
  return apiFetch<{ access: string; refresh: string }>("/api/auth/token/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export async function fetchAccounts(): Promise<ApiAccount[]> {
  return apiFetch<ApiAccount[]>("/api/accounts/");
}

// ─── Conversations ────────────────────────────────────────────────────────────

export async function fetchConversations(
  accountId: string,
  status = "open"
): Promise<ApiConversation[]> {
  return apiFetch<ApiConversation[]>(
    `/api/conversations/?account=${accountId}&status=${status}`
  );
}

export async function markConversationRead(conversationId: string) {
  return apiFetch(`/api/conversations/${conversationId}/mark_read/`, {
    method: "POST",
  });
}

// ─── Messages ────────────────────────────────────────────────────────────────

export async function fetchMessages(
  conversationId: string,
  page = 1
): Promise<PaginatedResponse<ApiMessage>> {
  return apiFetch<PaginatedResponse<ApiMessage>>(
    `/api/conversations/${conversationId}/messages/?page=${page}`
  );
}

export async function sendMessage(
  conversationId: string,
  content: string,
  quotedMessageId?: string
) {
  return apiFetch(`/api/conversations/${conversationId}/messages/send/`, {
    method: "POST",
    body: JSON.stringify({
      message_type: "text",
      content,
      ...(quotedMessageId ? { quoted_message_id: quotedMessageId } : {}),
    }),
  });
}