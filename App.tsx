
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Finance from './components/Finance';
import ScaleManager from './components/ScaleManager';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import PurchaseOrders from './components/PurchaseOrders';
import Login from './components/Login';
import Orders from './components/Orders';
import AuditLogs from './components/AuditLogs';
import Settings from './components/Settings';
import SuperAdmin from './components/SuperAdmin';
import Reports from './components/Reports'; // New Import
import { Product, Sale, FinancialTransaction, User, Customer, AuditLog, Company, StoreSettings, Plan, Integration, Supplier, PurchaseOrder } from './types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_CUSTOMERS, INITIAL_USERS } from './constants';

const INITIAL_PLANS: Plan[] = [
  { id: 'p1', name: 'Starter', price: 99, maxUsers: 2, maxProducts: 100, maxIntegrations: 0, features: ['pos', 'inventory'] },
  { id: 'p2', name: 'Professional', price: 199, maxUsers: 5, maxProducts: 1000, maxIntegrations: 2, features: ['pos', 'inventory', 'finance', 'loyalty', 'purchase_orders'] },
  { id: 'p3', name: 'Enterprise', price: 499, maxUsers: 99, maxProducts: 99999, maxIntegrations: 99, features: ['pos', 'inventory', 'finance', 'loyalty', 'aiInsights', 'multiStock', 'api', 'purchase_orders'] },
];

const GLOBAL_INTEGRATIONS: Integration[] = [
  { id: 'i1', name: 'iFood', slug: 'ifood', icon: 'fa-burger', description: 'Receba pedidos de delivery diretamente no seu PDV NaturaScale.', category: 'delivery' },
  { id: 'i2', name: 'Mercado Livre', slug: 'mercadolivre', icon: 'fa-handshake', description: 'Sincronize seu estoque e anuncie seus kits de produtos naturais.', category: 'marketplace' },
  { id: 'i3', name: 'Asaas Payments', slug: 'asaas', icon: 'fa-credit-card', description: 'Geração de boletos e cobrança recorrente automatizada.', category: 'payment' },
  { id: 'i4', name: 'Tiny ERP', slug: 'tiny', icon: 'fa-file-invoice', description: 'Sincronização fiscal e contábil avançada para grandes volumes.', category: 'erp' },
  { id: 'i5', name: 'WhatsApp Business', slug: 'whatsapp', icon: 'fa-whatsapp', description: 'Envie comprovantes e ofertas personalizadas pelo zap.', category: 'marketing' },
  { id: 'i6', name: 'Nuvemshop', slug: 'nuvemshop', icon: 'fa-shopping-bag', description: 'Venda seus produtos naturais online com estoque sincronizado.', category: 'ecommerce' },
];

const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp_1',
    subdomain: 'matriz',
    name: 'Natura Loja Matriz',
    cnpj: '12.345.678/0001-90',
    mainEmail: 'financeiro@naturamatriz.com.br',
    planId: 'p3',
    status: 'active',
    // Added mercadolivre to enabled integrations so it shows in Settings
    enabledIntegrations: ['ifood', 'whatsapp', 'tiny', 'asaas', 'nuvemshop', 'mercadolivre'],
    activeModules: { inventory: true, finance: true, loyalty: true, aiInsights: true, multiStock: true, pos: true, purchaseOrders: true },
    aiConfig: { provider: 'gemini' }, // Default AI
    databaseConfig: { provider: 'supabase', url: 'https://tenant1.supabase.co' },
    settings: {
      loyaltyEnabled: true,
      loyaltyName: 'NaturaPoints',
      loyaltySpendThreshold: 10,
      loyaltyPointValue: 1,
      redemptionType: 'points',
      currencySymbol: 'R$',
      salesChannels: ['Balcão', 'WhatsApp', 'iFood', 'Mercado Livre']
    }
  }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<'login' | 'superadmin' | 'store'>('login');
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 's1', companyId: 'comp_1', name: 'Bio Distribuidora', cnpj: '44.333.222/0001-11', email: 'vendas@biodist.com', phone: '(11) 3333-2222', category: 'Castanhas' }
  ]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'SUPERADMIN') {
      setCurrentRoute('superadmin');
      setActiveTab('overview');
    } else {
      const comp = companies.find(c => c.id === user.companyId) || companies[0];
      setCurrentCompany(comp);
      setCurrentRoute('store');
      setActiveTab(user.role === 'CASHIER' ? 'pos' : 'dashboard');
    }
  };

  const handleUpdateCompany = (updated: Company) => {
    setCompanies(prev => prev.map(c => c.id === updated.id ? updated : c));
    if (currentCompany?.id === updated.id) setCurrentCompany(updated);
  };

  const handleCompleteSale = (sale: Sale) => {
    setSales(prev => [...prev, sale]);

    setProducts(prevProducts => prevProducts.map(product => {
      const saleItem = sale.items.find(item => item.productId === product.id);
      if (saleItem) {
        return {
          ...product,
          exposedStock: product.exposedStock - saleItem.quantity
        };
      }
      return product;
    }));

    // Update Customer's point history logic or Last Purchase Date could go here
    // For now, Reports component calculates Last Purchase dynamically from Sales array.

    const logId = Math.random().toString(36).substr(2, 9);
    setLogs(prev => [...prev, {
        id: logId,
        action: 'VENDA REALIZADA',
        timestamp: new Date(),
        details: `Venda #${sale.id} - Total: R$ ${sale.totalAmount.toFixed(2)} - Canal: ${sale.origin}`,
        userName: currentUser?.name || 'Sistema'
    }]);
  };

  if (currentRoute === 'login' || !currentUser) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    if (currentRoute === 'superadmin') {
      return <SuperAdmin 
        activeTab={activeTab}
        companies={companies} 
        users={users}
        plans={plans}
        integrations={GLOBAL_INTEGRATIONS}
        onUpdateCompany={handleUpdateCompany}
        onAddCompany={(c) => setCompanies([...companies, c])}
        onUpdatePlans={setPlans}
        onAddUser={(u) => setUsers([...users, u])}
      />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard products={products} sales={sales} transactions={transactions} />;
      case 'reports': return <Reports sales={sales} customers={customers} />;
      case 'pos': return <POS products={products} customers={customers} currentUser={currentUser} settings={currentCompany!.settings} onCompleteSale={handleCompleteSale} />;
      case 'inventory': return <Inventory products={products} currentCompany={currentCompany!} onAddProduct={(p) => setProducts([...products, p])} onUpdateProduct={(p) => setProducts(products.map(x => x.id === p.id ? p : x))} onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))} onRecordMovement={(m) => {}} />;
      case 'customers': return <Customers customers={customers} onAddCustomer={(c) => setCustomers([...customers, c])} />;
      case 'suppliers': return <Suppliers suppliers={suppliers} onAddSupplier={(s) => setSuppliers([...suppliers, {...s, companyId: currentCompany!.id}])} />;
      case 'purchase_orders': return <PurchaseOrders orders={purchaseOrders} suppliers={suppliers} products={products} onAddOrder={(o) => setPurchaseOrders([...purchaseOrders, {...o, companyId: currentCompany!.id}])} />;
      case 'finance': return <Finance transactions={transactions} onAddTransaction={(t) => setTransactions([...transactions, t])} />;
      case 'settings': return <Settings company={currentCompany!} availableIntegrations={GLOBAL_INTEGRATIONS} onUpdateSettings={(s) => handleUpdateCompany({...currentCompany!, settings: s})} />;
      case 'orders': return <Orders sales={sales} />;
      case 'logs': return <AuditLogs logs={logs} />;
      default: return <Dashboard products={products} sales={sales} transactions={transactions} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} onLogout={() => setCurrentRoute('login')} currentCompany={currentCompany}>
       {currentRoute === 'store' && currentCompany && (
          <div className="mb-10 flex items-center justify-between border-b border-stone-200/50 pb-8">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-950 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-2xl shadow-emerald-900/20">
                   {currentCompany.name.charAt(0)}
                </div>
                <div>
                   <h1 className="text-3xl font-black text-stone-800 tracking-tight leading-none mb-1">{currentCompany.name}</h1>
                   <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{currentCompany.subdomain}.naturascale.com</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                      <span className="text-xs font-black text-stone-400 uppercase tracking-widest">{plans.find(p => p.id === currentCompany!.planId)?.name}</span>
                   </div>
                </div>
             </div>
             <div className="flex gap-2">
                {currentCompany.enabledIntegrations.map(slug => (
                   <div key={slug} className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center text-sm text-stone-400 shadow-sm hover:text-emerald-500 transition-colors cursor-help" title={slug}>
                      <i className={`fa-brands ${GLOBAL_INTEGRATIONS.find(i => i.slug === slug)?.icon}`}></i>
                   </div>
                ))}
             </div>
          </div>
       )}
       {renderContent()}
    </Layout>
  );
};

export default App;
