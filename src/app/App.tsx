import { useState } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import { HostSidebar, Host } from "./components/HostSidebar";
import { ConversationList, Conversation } from "./components/ConversationList";
import { ChatWindow, Message } from "./components/ChatWindow";
import { EmptyState } from "./components/EmptyState";

// Mock data
const mockHosts: Host[] = [
  {
    id: "1",
    name: "Empresa Alpha",
    avatar: "EA",
    color: "#3b82f6",
    unreadCount: 5,
  },
  {
    id: "2",
    name: "Empresa Beta",
    avatar: "EB",
    color: "#8b5cf6",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Suporte Tech",
    avatar: "ST",
    color: "#06b6d4",
    unreadCount: 2,
  },
  {
    id: "4",
    name: "Marketing Plus",
    avatar: "MP",
    color: "#ec4899",
  },
];

const mockConversations: Record<string, Conversation[]> = {
  "1": [
    {
      id: "c1",
      contactName: "Ana Silva",
      contactAvatar: "AS",
      lastMessage: "Ótimo! Vamos agendar a reunião para amanhã às 14h.",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: "c2",
      contactName: "Carlos Santos",
      contactAvatar: "CS",
      lastMessage: "Enviei os documentos por email. Pode verificar?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: "c3",
      contactName: "Beatriz Lima",
      contactAvatar: "BL",
      lastMessage: "Perfeito! Obrigada pela ajuda 😊",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: "c4",
      contactName: "Diego Pereira",
      contactAvatar: "DP",
      lastMessage: "Preciso de ajuda com o projeto. Você está disponível?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
      unreadCount: 3,
      isOnline: false,
    },
    {
      id: "c5",
      contactName: "Fernanda Costa",
      contactAvatar: "FC",
      lastMessage: "A apresentação ficou excelente!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      unreadCount: 0,
      isOnline: true,
    },
  ],
  "2": [
    {
      id: "c6",
      contactName: "Roberto Alves",
      contactAvatar: "RA",
      lastMessage: "Podemos conversar sobre o orçamento?",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: "c7",
      contactName: "Juliana Martins",
      contactAvatar: "JM",
      lastMessage: "Tudo certo! Já finalizei o relatório.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      unreadCount: 0,
      isOnline: false,
    },
  ],
  "3": [
    {
      id: "c8",
      contactName: "Cliente #4821",
      contactAvatar: "C1",
      lastMessage: "Meu sistema está apresentando um erro...",
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
      unreadCount: 1,
      isOnline: true,
    },
    {
      id: "c9",
      contactName: "Cliente #4820",
      contactAvatar: "C2",
      lastMessage: "Muito obrigado pelo suporte rápido!",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      unreadCount: 1,
      isOnline: false,
    },
  ],
  "4": [
    {
      id: "c10",
      contactName: "Equipe Criativa",
      contactAvatar: "EC",
      lastMessage: "As novas artes estão prontas para aprovação",
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      unreadCount: 0,
      isOnline: true,
    },
  ],
};

const mockMessages: Record<string, Message[]> = {
  c1: [
    {
      id: "m1",
      content: "Oi Ana! Tudo bem? Vi que você precisava falar sobre o projeto.",
      senderId: "me",
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      status: "read",
    },
    {
      id: "m2",
      content: "Oi! Sim, preciso discutir alguns pontos importantes do cronograma.",
      senderId: "ana",
      timestamp: new Date(Date.now() - 1000 * 60 * 18),
    },
    {
      id: "m3",
      content: "Claro! Podemos fazer uma reunião rápida?",
      senderId: "me",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: "read",
    },
    {
      id: "m4",
      content: "Ótimo! Vamos agendar a reunião para amanhã às 14h.",
      senderId: "ana",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
  ],
  c4: [
    {
      id: "m5",
      content: "Preciso de ajuda com o projeto. Você está disponível?",
      senderId: "diego",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  ],
};

export default function App() {
  const [selectedHostId, setSelectedHostId] = useState<string>("1");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);

  const currentConversations = mockConversations[selectedHostId] || [];
  const currentMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];
  const currentConversation = currentConversations.find(
    (c) => c.id === selectedConversationId
  );

  const handleSelectHost = (hostId: string) => {
    setSelectedHostId(hostId);
    setSelectedConversationId(null);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      content,
      senderId: "me",
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage],
    }));
  };

  return (
    <ThemeProvider>
      <div className="h-screen flex overflow-hidden bg-zinc-950">
        {/* Host Sidebar */}
        <HostSidebar
          hosts={mockHosts}
          selectedHostId={selectedHostId}
          onSelectHost={handleSelectHost}
        />

        {/* Conversation List */}
        <ConversationList
          conversations={currentConversations}
          selectedConversationId={selectedConversationId}
          onSelectConversation={setSelectedConversationId}
        />

        {/* Chat Window */}
        {selectedConversationId && currentConversation ? (
          <ChatWindow
            contactName={currentConversation.contactName}
            contactAvatar={currentConversation.contactAvatar}
            isOnline={currentConversation.isOnline}
            messages={currentMessages}
            currentUserId="me"
            onSendMessage={handleSendMessage}
          />
        ) : (
          <EmptyState />
        )}
      </div>
    </ThemeProvider>
  );
}
