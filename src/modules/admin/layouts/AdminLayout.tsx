
import React from 'react';
import { useRouter } from '../../../lib/router';

export const AdminLayout: React.FC<{ children: React.ReactNode; user?: any; onLogout: () => void }> = ({ children, user, onLogout }) => {
  const { navigate, path } = useRouter();

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'fa-chart-line' },
    { label: 'Tenants (Lojas)', path: '/admin/tenants', icon: 'fa-store' },
    { label: 'Planos & Billing', path: '/admin/plans', icon: 'fa-file-invoice-dollar' },
    { label: 'Auditoria Global', path: '/admin/audit', icon: 'fa-shield-halved' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <i className="fa-brands fa-searchengin text-indigo-500"></i>
            NaturaScale <span className="text-[10px] bg-indigo-600 px-1 rounded text-white ml-1">ADMIN</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                path === item.path 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
             <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">SA</div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name || 'Super Admin'}</p>
                <p className="text-[10px] text-slate-400">Master Access</p>
             </div>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors w-full">
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Sair do Console
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="font-bold text-slate-700">Visão Geral da Infraestrutura</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SYSTEM ONLINE
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
