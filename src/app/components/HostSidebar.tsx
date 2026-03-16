import { Plus } from "lucide-react";

export interface Host {
  id: string;
  name: string;
  avatar: string;
  color: string;
  unreadCount?: number;
}

interface HostSidebarProps {
  hosts: Host[];
  selectedHostId: string;
  onSelectHost: (hostId: string) => void;
}

export function HostSidebar({ hosts, selectedHostId, onSelectHost }: HostSidebarProps) {
  return (
    <div className="w-18 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 gap-3">
      {hosts.map((host) => (
        <button
          key={host.id}
          onClick={() => onSelectHost(host.id)}
          className={`relative group transition-all ${
            selectedHostId === host.id 
              ? 'rounded-2xl' 
              : 'rounded-full hover:rounded-2xl'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold transition-all ${
              selectedHostId === host.id ? 'ring-2 ring-white' : ''
            }`}
            style={{ backgroundColor: host.color }}
          >
            {host.avatar}
          </div>
          {host.unreadCount && host.unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {host.unreadCount > 9 ? '9+' : host.unreadCount}
            </div>
          )}
          
          {/* Indicador de seleção */}
          {selectedHostId === host.id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-1 h-8 bg-white rounded-r" />
          )}
        </button>
      ))}
      
      {/* Botão adicionar host */}
      <button className="w-12 h-12 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all hover:rounded-2xl group mt-2">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
