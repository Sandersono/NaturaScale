
import React from 'react';
import { User, Company } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  currentCompany: Company | null;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, currentUser, onLogout, currentCompany }) => {
  const isSuperAdmin = currentUser.role === 'SUPERADMIN';

  // SuperAdmin specialized menu
  const adminMenuItems = [
    { id: 'overview', icon: 'fa-chart-pie', label: 'Monitoramento' },
    { id: 'tenants', icon: 'fa-building', label: 'Inquilinos (Lojas)' },
    { id: 'users', icon: 'fa-user-gear', label: 'Contas & Acessos' },
    { id: 'plans', icon: 'fa-tags', label: 'Planos & Add-ons' },
    { id: 'marketplace', icon: 'fa-plug', label: 'Marketplace Global' },
    { id: 'database', icon: 'fa-database', label: 'Banco de Dados' },
  ];

  // Store specialized menu based on features
  const storeMenuItems = [
    { id: 'dashboard', icon: 'fa-house', label: 'Início', enabled: true },
    { id: 'reports', icon: 'fa-chart-column', label: 'Relatórios', enabled: true },
    { id: 'pos', icon: 'fa-cash-register', label: 'Vendas (PDV)', enabled: currentCompany?.activeModules.pos },
    { id: 'orders', icon: 'fa-file-invoice-dollar', label: 'Pedidos', enabled: true },
    { id: 'inventory', icon: 'fa-boxes-stacked', label: 'Produtos & Estoque', enabled: currentCompany?.activeModules.inventory },
    { id: 'suppliers', icon: 'fa-truck-field', label: 'Fornecedores', enabled: currentCompany?.activeModules.purchaseOrders },
    { id: 'purchase_orders', icon: 'fa-file-contract', label: 'Compras', enabled: currentCompany?.activeModules.purchaseOrders },
    { id: 'customers', icon: 'fa-users', label: 'Clientes', enabled: true },
    { id: 'finance', icon: 'fa-wallet', label: 'Financeiro', enabled: currentCompany?.activeModules.finance },
    { id: 'settings', icon: 'fa-gears', label: 'Ajustes', enabled: true },
  ];

  const currentMenu = isSuperAdmin ? adminMenuItems : storeMenuItems.filter(m => m.enabled);
  const sidebarColor = isSuperAdmin ? 'bg-indigo-950' : 'bg-emerald-950';
  const accentColor = isSuperAdmin ? 'bg-indigo-600' : 'bg-emerald-500';

  return (
    <div className="flex min-h-screen bg-[#f8f9fc]">
      <aside className={`w-72 ${sidebarColor} text-white flex-shrink-0 hidden md:flex flex-col border-r border-black/10 transition-all duration-700 shadow-2xl`}>
        <div className="p-10">
          <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
            <i className={`fa-leaf ${isSuperAdmin ? 'text-indigo-400' : 'text-emerald-400'}`}></i>
            NaturaScale
          </h1>
          <p className={`${isSuperAdmin ? 'text-indigo-400/60' : 'text-emerald-400/60'} text-[10px] mt-2 uppercase font-black tracking-[0.3em]`}>
            {isSuperAdmin ? 'Cloud Backoffice' : 'Operação Local'}
          </p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {currentMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all group ${
                activeTab === item.id 
                  ? `${accentColor} text-white shadow-2xl shadow-black/30 scale-[1.02]` 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg w-6 text-center transition-transform group-hover:scale-110`}></i>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mx-4 mb-8 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-2xl ${accentColor} flex items-center justify-center text-white font-black text-lg shadow-xl`}>
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black truncate">{currentUser.name}</p>
              <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">{currentUser.role}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full py-3 bg-black/30 hover:bg-red-900/40 hover:text-red-300 text-white/40 rounded-2xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-2">
            <i className="fa-power-off"></i> ENCERRAR SESSÃO
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-10 pb-24 md:pb-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
