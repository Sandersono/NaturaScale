
import React, { useState } from 'react';
import Layout from '../../components/Layout';
import Dashboard from '../../components/Dashboard';
import POS from '../../components/POS';
import Inventory from '../../components/Inventory';
import Finance from '../../components/Finance';
import Customers from '../../components/Customers';
import Suppliers from '../../components/Suppliers';
import PurchaseOrders from '../../components/PurchaseOrders';
import Orders from '../../components/Orders';
import AuditLogs from '../../components/AuditLogs';
import Settings from '../../components/Settings';
import Reports from '../../components/Reports';
import { Product, Sale, FinancialTransaction, User, Customer, AuditLog, Company, Supplier, PurchaseOrder, Integration } from '../../types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS, INITIAL_CUSTOMERS, INITIAL_USERS } from '../../constants';

// Configurações globais que o App da loja precisa
const GLOBAL_INTEGRATIONS: Integration[] = [
  { id: 'i1', name: 'iFood', slug: 'ifood', icon: 'fa-burger', description: 'Receba pedidos de delivery diretamente no seu PDV.', category: 'delivery' },
  { id: 'i2', name: 'Mercado Livre', slug: 'mercadolivre', icon: 'fa-handshake', description: 'Sincronize seu estoque.', category: 'marketplace' },
  { id: 'i3', name: 'Asaas Payments', slug: 'asaas', icon: 'fa-credit-card', description: 'Cobrança recorrente automatizada.', category: 'payment' },
  { id: 'i4', name: 'Tiny ERP', slug: 'tiny', icon: 'fa-file-invoice', description: 'Sincronização fiscal.', category: 'erp' },
  { id: 'i5', name: 'WhatsApp', slug: 'whatsapp', icon: 'fa-whatsapp', description: 'Envie comprovantes.', category: 'marketing' },
  { id: 'i6', name: 'Nuvemshop', slug: 'nuvemshop', icon: 'fa-shopping-bag', description: 'E-commerce integrado.', category: 'ecommerce' },
];

const MOCK_COMPANY: Company = {
    id: 'comp_1',
    subdomain: 'matriz',
    name: 'Natura Loja Matriz',
    cnpj: '12.345.678/0001-90',
    mainEmail: 'financeiro@naturamatriz.com.br',
    planId: 'p3',
    status: 'active',
    enabledIntegrations: ['ifood', 'whatsapp', 'tiny', 'asaas', 'nuvemshop', 'mercadolivre'],
    activeModules: { inventory: true, finance: true, loyalty: true, aiInsights: true, multiStock: true, pos: true, purchaseOrders: true },
    aiConfig: { provider: 'gemini' },
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
};

interface ShopAppProps {
    user: User;
    onLogout: () => void;
}

export const ShopApp: React.FC<ShopAppProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState(user.role === 'CASHIER' ? 'pos' : 'dashboard');
  const [currentCompany, setCurrentCompany] = useState<Company>(MOCK_COMPANY);
  
  // Data State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    { id: 's1', companyId: 'comp_1', name: 'Bio Distribuidora', cnpj: '44.333.222/0001-11', email: 'vendas@biodist.com', phone: '(11) 3333-2222', category: 'Castanhas' }
  ]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  const handleCompleteSale = (sale: Sale) => {
    setSales(prev => [...prev, sale]);
    setProducts(prevProducts => prevProducts.map(product => {
      const saleItem = sale.items.find(item => item.productId === product.id);
      if (saleItem) {
        return { ...product, exposedStock: product.exposedStock - saleItem.quantity };
      }
      return product;
    }));
    const logId = Math.random().toString(36).substr(2, 9);
    setLogs(prev => [...prev, {
        id: logId,
        action: 'VENDA REALIZADA',
        timestamp: new Date(),
        details: `Venda #${sale.id} - Total: R$ ${sale.totalAmount.toFixed(2)}`,
        userName: user.name
    }]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard products={products} sales={sales} transactions={transactions} />;
      case 'reports': return <Reports sales={sales} customers={customers} />;
      case 'pos': return <POS products={products} customers={customers} currentUser={user} settings={currentCompany.settings} onCompleteSale={handleCompleteSale} />;
      case 'inventory': return <Inventory products={products} currentCompany={currentCompany} onAddProduct={(p) => setProducts([...products, p])} onUpdateProduct={(p) => setProducts(products.map(x => x.id === p.id ? p : x))} onDeleteProduct={(id) => setProducts(products.filter(p => p.id !== id))} onRecordMovement={() => {}} />;
      case 'customers': return <Customers customers={customers} onAddCustomer={(c) => setCustomers([...customers, c])} />;
      case 'suppliers': return <Suppliers suppliers={suppliers} onAddSupplier={(s) => setSuppliers([...suppliers, {...s, companyId: currentCompany.id}])} />;
      case 'purchase_orders': return <PurchaseOrders orders={purchaseOrders} suppliers={suppliers} products={products} onAddOrder={(o) => setPurchaseOrders([...purchaseOrders, {...o, companyId: currentCompany.id}])} />;
      case 'finance': return <Finance transactions={transactions} onAddTransaction={(t) => setTransactions([...transactions, t])} />;
      case 'settings': return <Settings company={currentCompany} availableIntegrations={GLOBAL_INTEGRATIONS} onUpdateSettings={(s) => setCurrentCompany({...currentCompany, settings: s})} />;
      case 'orders': return <Orders sales={sales} />;
      case 'logs': return <AuditLogs logs={logs} />;
      default: return <Dashboard products={products} sales={sales} transactions={transactions} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} currentUser={user} onLogout={onLogout} currentCompany={currentCompany}>
      {/* Header da Loja */}
      <div className="mb-8 flex items-center justify-between border-b border-stone-200/50 pb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-950 text-white rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-2xl shadow-emerald-900/20">
                {currentCompany.name.charAt(0)}
            </div>
            <div>
                <h1 className="text-3xl font-black text-stone-800 tracking-tight leading-none mb-1">{currentCompany.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">{currentCompany.subdomain}.naturascale.com</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                  <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Enterprise Plan</span>
                </div>
            </div>
          </div>
      </div>
      {renderContent()}
    </Layout>
  );
};
