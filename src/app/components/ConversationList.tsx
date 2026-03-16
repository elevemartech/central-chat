import { Search, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface Conversation {
  id: string;
  contactName: string;
  contactAvatar: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  isOnline: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 1) {
      return format(date, "HH:mm");
    } else if (days < 7) {
      return format(date, "EEEEEE", { locale: ptBR });
    } else {
      return format(date, "dd/MM/yy");
    }
  };

  return (
    <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white">Conversas</h1>
          <button className="text-zinc-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar conversas..."
            className="w-full bg-zinc-800 text-white placeholder:text-zinc-500 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-zinc-800 transition-colors ${
              selectedConversationId === conversation.id ? 'bg-zinc-800' : ''
            }`}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {conversation.contactAvatar}
              </div>
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-zinc-900" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white truncate">
                  {conversation.contactName}
                </h3>
                <span className="text-xs text-zinc-500 flex-shrink-0 ml-2">
                  {formatTime(conversation.timestamp)}
                </span>
              </div>
              <p className="text-sm text-zinc-400 truncate">
                {conversation.lastMessage}
              </p>
            </div>

            {/* Unread Badge */}
            {conversation.unreadCount > 0 && (
              <div className="flex-shrink-0 mt-1">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
