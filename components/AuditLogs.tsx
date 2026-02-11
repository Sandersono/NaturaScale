
import React from 'react';
import { AuditLog } from '../types';

interface AuditLogsProps {
  logs: AuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-stone-800">Auditoria do Sistema</h2>
          <p className="text-stone-500">Rastreabilidade completa de todas as ações.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-50 bg-stone-50/50">
          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Linha do Tempo de Atividades</p>
        </div>
        <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
          {logs.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(log => (
            <div key={log.id} className="p-4 flex gap-4 hover:bg-stone-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 flex-shrink-0">
                <i className="fa-clock-rotate-left"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-stone-800 truncate">{log.action}</p>
                  <span className="text-[10px] text-stone-400 font-medium whitespace-nowrap ml-4">
                    {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mb-2 leading-relaxed">{log.details}</p>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[8px] font-black">
                    {log.userName.charAt(0)}
                  </span>
                  <span className="text-[9px] font-black text-emerald-700 uppercase">{log.userName}</span>
                </div>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="p-12 text-center text-stone-400 italic">Nenhum registro de atividade.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
