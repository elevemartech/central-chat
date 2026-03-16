import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchAccounts,
  fetchConversations,
  fetchMessages,
  sendMessage as apiSendMessage,
  markConversationRead,
  ApiAccount,
  ApiConversation,
  ApiMessage,
} from "../api/endpoints";
import { createWebSocket } from "../api/client";

// ─── useAccounts ──────────────────────────────────────────────────────────────

export function useAccounts() {
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts()
      .then(setAccounts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { accounts, loading, error };
}

// ─── useConversations ─────────────────────────────────────────────────────────

export function useConversations(accountId: string | null) {
  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    if (!accountId) return;
    setLoading(true);
    fetchConversations(accountId)
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [accountId]);

  useEffect(() => {
    setConversations([]);
    load();
  }, [load]);

  // WebSocket — escuta atualizações de conversas da conta
  useEffect(() => {
    if (!accountId) return;

    const ws = createWebSocket(`/ws/accounts/${accountId}/`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "conversation_update") {
        const updated: ApiConversation = data.data;
        setConversations((prev) => {
          const exists = prev.find((c) => c.id === updated.id);
          if (exists) {
            // Atualiza e reordena pelo mais recente
            return [...prev.map((c) => (c.id === updated.id ? updated : c))].sort(
              (a, b) =>
                new Date(b.last_message_at ?? 0).getTime() -
                new Date(a.last_message_at ?? 0).getTime()
            );
          }
          // Nova conversa — adiciona no topo
          return [updated, ...prev];
        });
      }
    };

    ws.onerror = (e) => console.warn("WS accounts error:", e);

    return () => ws.close();
  }, [accountId]);

  return { conversations, loading, reload: load, setConversations };
}

// ─── useMessages ──────────────────────────────────────────────────────────────

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Carrega histórico ao trocar de conversa
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    setLoading(true);
    fetchMessages(conversationId)
      .then((res) => setMessages(res.results))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Zera não lidos ao abrir
    markConversationRead(conversationId).catch(console.error);
  }, [conversationId]);

  // WebSocket — mensagens em tempo real
  useEffect(() => {
    if (!conversationId) return;

    const ws = createWebSocket(`/ws/conversations/${conversationId}/`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_message") {
        const msg: ApiMessage = data.message;
        setMessages((prev) => {
          // Evita duplicata (mensagem otimista pode já estar na lista)
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }

      if (data.type === "message_status") {
        const { uazapi_message_id, status } = data.data;
        setMessages((prev) =>
          prev.map((m) =>
            m.uazapi_message_id === uazapi_message_id ? { ...m, status } : m
          )
        );
      }
    };

    ws.onerror = (e) => console.warn("WS conversation error:", e);

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [conversationId]);

  // Envio com mensagem otimista
  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim()) return;

      // Mensagem otimista enquanto aguarda confirmação
      const optimistic: ApiMessage = {
        id: `optimistic-${Date.now()}`,
        conversation: conversationId,
        uazapi_message_id: null,
        direction: "outbound",
        message_type: "text",
        status: "pending",
        content,
        media_url: "",
        media_mime: "",
        media_filename: "",
        audio_duration_seconds: null,
        audio_transcription: "",
        quoted_message_id: "",
        quoted_content: "",
        timestamp: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimistic]);
      setSending(true);

      try {
        await apiSendMessage(conversationId, content);
        // O WebSocket vai trazer a mensagem real — a otimista fica até a real chegar
      } catch (e) {
        console.error("Erro ao enviar mensagem:", e);
        // Remove mensagem otimista em caso de erro
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      } finally {
        setSending(false);
      }
    },
    [conversationId]
  );

  return { messages, loading, sending, sendMessage };
}