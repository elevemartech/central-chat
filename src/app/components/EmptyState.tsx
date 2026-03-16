import { MessageSquare } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex-1 bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-10 h-10 text-zinc-600" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Selecione uma conversa
        </h2>
        <p className="text-zinc-500">
          Escolha uma conversa da lista para começar a enviar mensagens
        </p>
      </div>
    </div>
  );
}
