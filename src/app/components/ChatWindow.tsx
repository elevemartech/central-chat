import { useState } from "react";
import {
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  Send,
} from "lucide-react";
import { format } from "date-fns";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatWindowProps {
  contactName: string;
  contactAvatar: string;
  isOnline: boolean;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
}

export function ChatWindow({
  contactName,
  contactAvatar,
  isOnline,
  messages,
  currentUserId,
  onSendMessage,
}: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="h-16 bg-zinc-900 border-b border-zinc-800 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {contactAvatar}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-white">{contactName}</h2>
            <p className="text-xs text-zinc-400">
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === currentUserId;
          const showTimestamp =
            index === 0 ||
            message.timestamp.getTime() - messages[index - 1].timestamp.getTime() >
              5 * 60 * 1000;

          return (
            <div key={message.id}>
              {showTimestamp && (
                <div className="flex justify-center my-4">
                  <span className="text-xs text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">
                    {format(message.timestamp, "dd/MM/yyyy HH:mm")}
                  </span>
                </div>
              )}
              <div
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    isCurrentUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-zinc-800 text-white rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 justify-end ${
                      isCurrentUser ? "text-blue-200" : "text-zinc-500"
                    }`}
                  >
                    <span className="text-xs">
                      {format(message.timestamp, "HH:mm")}
                    </span>
                    {isCurrentUser && message.status && (
                      <span className="text-xs">
                        {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-6 py-4">
        <div className="flex items-end gap-3">
          <button className="w-10 h-10 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-white placeholder:text-zinc-500 focus:outline-none"
            />
            <button className="text-zinc-400 hover:text-white transition-colors">
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!inputMessage.trim()}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              inputMessage.trim()
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-zinc-800 text-zinc-600"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
