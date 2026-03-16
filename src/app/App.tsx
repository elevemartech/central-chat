import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginScreen } from "./components/LoginScreen";
import { HostSidebar, Host } from "./components/HostSidebar";
import { ConversationList, Conversation } from "./components/ConversationList";
import { ChatWindow, Message } from "./components/ChatWindow";
import { EmptyState } from "./components/EmptyState";
import { useAccounts, useConversations, useMessages } from "./hooks/useChat";
import { ApiAccount, ApiConversation, ApiMessage } from "./api/endpoints";
import { useState } from "react";

// ─── Adaptadores API → tipos do frontend ─────────────────────────────────────

function accountToHost(a: ApiAccount): Host {
  const initials = a.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return {
    id: a.id,
    name: a.name,
    avatar: initials,           // iniciais quando não há imagem
    color: a.color || "#3b82f6",
  };
}

function conversationToFrontend(c: ApiConversation): Conversation {
  const name = c.contact_name || c.contact_phone || "Desconhecido";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return {
    id: c.id,
    contactName: name,
    contactAvatar: c.contact_avatar || initials,
    lastMessage: c.last_message_preview || "",
    timestamp: c.last_message_at ? new Date(c.last_message_at) : new Date(0),
    unreadCount: c.unread_count,
    isOnline: false,            // API não expõe presença — sempre offline
  };
}

function messageToFrontend(m: ApiMessage): Message {
  return {
    id: m.id,
    content: m.content || `[${m.message_type}]`,
    senderId: m.direction === "outbound" ? "me" : "contact",
    timestamp: new Date(m.timestamp),
    status: m.status === "pending" || m.status === "failed"
      ? "sent"
      : (m.status as "sent" | "delivered" | "read"),
  };
}

// ─── Inner app (autenticado) ──────────────────────────────────────────────────

function ChatApp() {
  const [selectedHostId, setSelectedHostId] = useState<string | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const { accounts, loading: loadingAccounts } = useAccounts();
  const { conversations, loading: loadingConvs } = useConversations(selectedHostId);
  const { messages, sending, sendMessage } = useMessages(selectedConversationId);

  // Seleciona o primeiro host automaticamente após carregar
  if (!selectedHostId && accounts.length > 0) {
    setSelectedHostId(accounts[0].id);
  }

  const hosts = accounts.map(accountToHost);

  // Calcula unreadCount por host somando as conversas já carregadas
  const hostsWithUnread = hosts.map((h) => {
    if (h.id !== selectedHostId) return h;
    const total = conversations.reduce((sum, c) => sum + c.unread_count, 0);
    return { ...h, unreadCount: total };
  });

  const frontendConversations = conversations.map(conversationToFrontend);
  const frontendMessages = messages.map(messageToFrontend);

  const currentConversation = frontendConversations.find(
    (c) => c.id === selectedConversationId
  );

  const handleSelectHost = (hostId: string) => {
    setSelectedHostId(hostId);
    setSelectedConversationId(null);
  };

  if (loadingAccounts) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-zinc-950">
      {/* Coluna 1 — Hosts */}
      <HostSidebar
        hosts={hostsWithUnread}
        selectedHostId={selectedHostId ?? ""}
        onSelectHost={handleSelectHost}
      />

      {/* Coluna 2 — Conversas */}
      <ConversationList
        conversations={frontendConversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />

      {/* Coluna 3 — Chat */}
      {selectedConversationId && currentConversation ? (
        <ChatWindow
          contactName={currentConversation.contactName}
          contactAvatar={currentConversation.contactAvatar}
          isOnline={currentConversation.isOnline}
          messages={frontendMessages}
          currentUserId="me"
          onSendMessage={sendMessage}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// ─── Root — decide login ou app ───────────────────────────────────────────────

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        Carregando...
      </div>
    );
  }

  return isAuthenticated ? <ChatApp /> : <LoginScreen />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}